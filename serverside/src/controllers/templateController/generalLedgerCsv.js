const GeneralLedger = require("../../models/ledgerModels/generalLedger");
const generateCsv = require("../../utils/generateCsv");

module.exports = {
  generateCSV: async (req, res) => {
    try {
      let { startDate, endDate } = req.query;

      startDate = startDate ? new Date(startDate) : null;
      endDate = endDate ? new Date(endDate) : null;

      const generalLedgerData = await GeneralLedger.find({
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate ? { $gte: startDate } : {}),
                ...(endDate ? { $lte: endDate } : {}),
              },
            }
          : {}),
      })
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .populate("incomeHeadOfAccount", "headOfAccount")
        .sort({ date: 1 });

      if (!generalLedgerData.length) {
        return res.status(400).json({ message: "No data found" });
      }

      const firstEntry = generalLedgerData[0];
      const lastEntry = generalLedgerData[generalLedgerData.length - 1];

      const startingBalance = firstEntry?.previousBalance || 0;
      const closingBalance = lastEntry?.balance || 0;

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

      // Generate CSV body from ledger data
      const csvBody = await generateCsv(
        fields,
        fieldsKeyMapping,
        formattedData
      );

      // Add metadata rows at the top
      const metadataRows = [
        [
          `START DATE`,
          (startDate || firstEntry.date)
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-"),
        ],
        [
          `END DATE`,
          (endDate || lastEntry.date)
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-"),
        ],
        [`STARTING BALANCE`, startingBalance.toString()],
        [`CLOSING BALANCE`, closingBalance.toString()],
        [], // empty row for separation
      ]
        .map((row) => row.join(","))
        .join("\n");

      const finalCsv = `${metadataRows}\n${csvBody}`;

      res.header("Content-Type", "text/csv");
      res.attachment("generalLedger.csv");
      res.send(finalCsv);
    } catch (error) {
      console.error("Error generating CSV:", error);
      res.status(500).send("Failed to generate CSV");
    }
  },
};
