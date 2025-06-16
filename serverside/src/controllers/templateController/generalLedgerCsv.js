const GeneralLedger = require("../../models/ledgerModels/generalLedger");
const generateCsv = require("../../utils/generateCsv");

module.exports = {
  generateCSV: async (req, res) => {
    try {
      let { startDate, endDate } = req.query;
      startDate = new Date(startDate);
      endDate = new Date(endDate);

      const generalLedgerData = await GeneralLedger.find({
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

      const firstEntry = generalLedgerData[0];
      const lastEntry = generalLedgerData[generalLedgerData.length - 1];

      if (!lastEntry) {
        return res.status(400).json({ message: "No data found" });
      }

      const formattedData = generalLedgerData.map((doc) => ({
        date: doc.date?.toLocaleDateString("en-GB").replace(/\//g, "-"),
        headOfAccount:
          doc.credit === undefined
            ? doc.mainHeadOfAccount?.headOfAccount ||
              doc.subHeadOfAccount?.headOfAccount
            : doc.incomeHeadOfAccount?.headOfAccount,
        particulars: doc.particular,
        chequeNo: doc.chequeNo || "",
        challanNo: doc.challanNo || "",
        voucherNo: doc.voucherNo || "",
        debit: doc.debit || "",
        credit: doc.credit || "",
        balance: doc.balance || "",
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
        "Head of Account": "headOfAccount",
        Particulars: "particulars",
        "Cheque No.": "chequeNo",
        "Challan No.": "challanNo",
        "Voucher No.": "voucherNo",
        Debit: "debit",
        Credit: "credit",
        Balance: "balance",
      };

      const csv = await generateCsv(fields, fieldsKeyMapping, formattedData);

      res.header("Content-Type", "text/csv");
      res.attachment("generalLedger.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error generating CSV:", error);
      res.status(500).send("Failed to generate CSV");
    }
  },
};
