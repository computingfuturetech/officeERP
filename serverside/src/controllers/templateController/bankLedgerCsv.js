const BankLedger = require("../../models/ledgerModels/bankLedger");
const CheckBank = require("../../services/checkBank");
const BankBalance = require("../../models/bankModel/bankBalance");
const path = require("path");
const generateCsv = require("../../utils/generateCsv");

module.exports = {
  generateCSV: async (req, res) => {
    try {
      let { startDate, endDate, bank_account } = req.query;
      startDate = new Date(startDate);
      endDate = new Date(endDate);

      let bankLedgerData;
      let latestBalanceDoc;
      let balance;
      let totalBalance;
      let bank_id;
      let bankName;

      if (bank_account) {
        let bankDetails = await CheckBank.checkBank(req, res, bank_account);

        if (!bankDetails.bankId)
          return res.status(400).json({ message: "Bank not found" });

        bank_id = bankDetails.bankId;
        bankName = bankDetails.bankName;
        bankLedgerData = await BankLedger.find({
          ...(!isNaN(startDate) || !isNaN(endDate)
            ? {
                date: {
                  ...(!isNaN(startDate) ? { $gte: startDate } : {}),
                  ...(!isNaN(endDate) ? { $lte: endDate } : {}),
                },
              }
            : {}),
          bank: bank_id,
        })
          .populate("mainHeadOfAccount", "headOfAccount")
          .populate("subHeadOfAccount", "headOfAccount")
          .populate("incomeHeadOfAccount", "headOfAccount")
          .sort({ date: 1 });

        totalBalance = await BankBalance.aggregate([
          {
            $group: {
              _id: null,
              totalBalance: { $sum: "$balance" },
            },
          },
        ]);

        if (totalBalance.length > 0) {
          latestBalanceDoc = await BankBalance.findOne({
            bank: bank_id,
          }).exec();
          balance = latestBalanceDoc ? latestBalanceDoc.balance : 0;
        }
      } else {
        return res.status(400).json({ message: "Provide Bank Account Number" });
      }

      const firstEntry = bankLedgerData[0];
      const lastEntry = bankLedgerData[bankLedgerData.length - 1];
      if (!lastEntry) {
        return res.status(400).json({ message: "No data found" });
      }

      bankLedgerData = bankLedgerData.map((document) => ({
        ...document.toObject(),
        date: document.date?.toLocaleDateString("en-GB").replace(/\//g, "-"),
        _headOfAccount:
          document.credit === undefined
            ? document.mainHeadOfAccount?.headOfAccount ||
              document.subHeadOfAccount?.headOfAccount
            : document.incomeHeadOfAccount?.headOfAccount,
      }));

      const fields = [
        "Date",
        "Head of Account",
        "Particulars",
        "Cheque No.",
        "Challan No.",
        "Voucher No.",
        "Debit",
        "Credit",
        "Balance",
      ];

      const fieldsKeyMapping = {
        Date: "date",
        "Head of Account": "_headOfAccount", // fixed key
        Particulars: "particular",
        "Cheque No.": "chequeNo",
        "Challan No.": "challanNo",
        "Voucher No.": "voucherNo",
        Debit: "debit",
        Credit: "credit",
        Balance: "balance",
      };

      // Summary metadata section
      const summaryRows = [
        [
          "START DATE",
          (!isNaN(startDate) ? startDate : firstEntry.date).toLocaleDateString(
            "en-GB"
          ),
        ],
        [
          "END DATE",
          (!isNaN(endDate) ? endDate : lastEntry.date).toLocaleDateString(
            "en-GB"
          ),
        ],
        ["BANK NAME", bankName],
        ["ACCOUNT NUMBER", bank_account],
        ["STARTING BALANCE", firstEntry.previousBalance],
        ["CLOSING BALANCE", lastEntry.balance],
        [], // blank row
      ];

      // Ledger data rows
      const tableRows = bankLedgerData.map((entry) =>
        fields.map((field) => entry[fieldsKeyMapping[field]] ?? "")
      );

      const allRows = [
        ...summaryRows,
        fields, // table headers
        ...tableRows, // table data
      ];

      const csv = allRows.map((row) => row.join(",")).join("\n");

      res.header("Content-Type", "text/csv");
      res.attachment("bankLedger.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error generating CSV:", error);
      res.status(500).send("Failed to generate CSV");
    }
  },
};
