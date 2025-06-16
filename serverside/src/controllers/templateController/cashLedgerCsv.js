const CashLedger = require("../../models/ledgerModels/cashBookLedger");
const FixedAmount = require("../../models/fixedAmountModel/fixedAmount");
const generateCsv = require("../../utils/generateCsv"); // assuming same helper you used in bankLedger

module.exports = {
  generateCSV: async (req, res) => {
    try {
      let { startDate, endDate } = req.query;
      startDate = new Date(startDate);
      endDate = new Date(endDate);

      let cashLedgerData = await CashLedger.find({
        ...(!isNaN(startDate) || !isNaN(endDate)
          ? {
              date: {
                ...(!isNaN(startDate) ? { $gte: startDate } : {}),
                ...(!isNaN(endDate) ? { $lte: endDate } : {}),
              },
            }
          : {}),
      })
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .populate("incomeHeadOfAccount", "headOfAccount")
        .sort({ date: 1 });

      const firstEntry = cashLedgerData[0];
      const lastEntry = cashLedgerData[cashLedgerData.length - 1];

      if (!lastEntry) {
        return res.status(400).json({ message: "No data found" });
      }

      cashLedgerData = cashLedgerData.map((document) => ({
        date: document.date?.toLocaleDateString("en-GB").replace(/\//g, "-"),
        headOfAccount:
          document.credit === undefined
            ? document.mainHeadOfAccount?.headOfAccount ||
              document.subHeadOfAccount?.headOfAccount
            : document.incomeHeadOfAccount?.headOfAccount,
        particulars: document.particular,
        voucherNo: document.voucherNo,
        debit: document.debit || "",
        credit: document.credit || "",
        balance: document.balance,
      }));

      const fields = [
        "Date",
        "Head of Account",
        "Particulars",
        "Voucher No.",
        "Debit",
        "Credit",
        "Balance",
      ];

      const fieldsKeyMapping = {
        Date: "date",
        "Head of Account": "headOfAccount",
        Particulars: "particulars",
        "Voucher No.": "voucherNo",
        Debit: "debit",
        Credit: "credit",
        Balance: "balance",
      };

      // Metadata section
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
        ["STARTING BALANCE", firstEntry.previousBalance ?? firstEntry.balance],
        ["CLOSING BALANCE", lastEntry.balance],
        [], // empty line
      ];

      // Ledger data section
      const tableRows = cashLedgerData.map((entry) =>
        fields.map((field) => entry[fieldsKeyMapping[field]] ?? "")
      );

      const allRows = [
        ...summaryRows,
        fields, // header
        ...tableRows, // ledger
      ];

      const csv = allRows.map((row) => row.join(",")).join("\n");

      res.header("Content-Type", "text/csv");
      res.attachment("cashLedger.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error generating CSV:", error);
      res.status(500).send("Failed to generate CSV");
    }
  },
};
