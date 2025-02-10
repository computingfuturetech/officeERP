const fs = require("fs");
const FixedAmount = require("../../models/fixedAmountModel/fixedAmount");
const CashLedger = require("../../models/ledgerModels/cashBookLedger");
const path = require("path");
const getLedgerDetailHtml = require("../../utils/getLedgerDetailHtml");
const getLedgerTableHtml = require("../../utils/getLedgerTableHtml");
const generatePdf = require("../../utils/generatePdf");
const ledgerTemplatePath = path.join(
  __dirname,
  "../../views/ledgerTemplate.html"
);
let ledgerTemplateHtml = fs.readFileSync(ledgerTemplatePath, "utf-8");

module.exports = {
  generatePDF: async (req, res) => {
    try {
      let { startDate, endDate } = req.query;
      startDate = new Date(startDate);
      endDate = new Date(endDate);

      let cashLedgerData = await CashLedger.find({
        ...(!isNaN(startDate) || !isNaN(endDate)
          ? {
              date: {
                ...(!isNaN(startDate)
                  ? {
                      $gte: startDate,
                    }
                  : {}),
                ...(!isNaN(endDate)
                  ? {
                      $lte: endDate,
                    }
                  : {}),
              },
            }
          : {}),
      })
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .populate("incomeHeadOfAccount", "headOfAccount");

      let latestBalanceCash = await FixedAmount.findOne({})
        .sort({ cashOpeningBalance: -1 })
        .exec();

      const startingBalance = latestBalanceCash?.cashOpeningBalance || 0;
      const lastEntry = cashLedgerData[cashLedgerData.length - 1];
      const balance = lastEntry?.balance || 0;

      cashLedgerData = cashLedgerData.map((document) => ({
        ...document.toObject(),
        date: document.date?.toLocaleDateString("en-GB").replace(/\//g, "-"),
        _headOfAccount:
          document.credit === undefined
            ? document.mainHeadOfAccount?.headOfAccount || document.subHeadOfAccount?.headOfAccount
            : document.incomeHeadOfAccount?.headOfAccount,
      }));

      ledgerTemplateHtml = ledgerTemplateHtml.replace(
        "{{ledgerHeading}}",
        "Cash Ledger"
      );
      ledgerTemplateHtml = ledgerTemplateHtml.replace(
        "{{ledgerDetail}}",
        getLedgerDetailHtml({
          "STARTING BALANCE": startingBalance.toString(),
          "CLOSING BALANCE": balance.toString(),
          ...(!isNaN(startDate)
            ? {
                "START DATE": startDate
                  .toLocaleDateString("en-GB")
                  .replace(/\//g, "-"),
              }
            : {}),
          ...(!isNaN(endDate)
            ? {
                "END DATE": endDate
                  .toLocaleDateString("en-GB")
                  .replace(/\//g, "-"),
              }
            : {}),
        })
      );
      ledgerTemplateHtml = ledgerTemplateHtml.replace(
        "{{ledgerTable}}",
        getLedgerTableHtml({
          columns: [
            {
              label: "Date",
              key: "date",
              inSingleLine: true,
            },
            {
              label: "Head of Account",
              key: "_headOfAccount",
            },
            {
              label: "Particulars",
              key: "particular",
            },
            {
              label: "Voucher No.",
              key: "voucherNo",
              inSingleLine: true,
            },
            {
              label: "Debit",
              key: "debit",
            },
            {
              label: "Credit",
              key: "credit",
            },
            {
              label: "Balance",
              key: "balance",
            },
          ],
          data: cashLedgerData,
        })
      );
      const pdfBuffer = await generatePdf(ledgerTemplateHtml);

      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Content-Disposition": 'attachment; filename="cash-ledger.pdf"',
      });
      return res.end(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Failed to generate PDF");
    }
  },
};
