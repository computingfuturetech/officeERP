const fs = require("fs");
const BankLedger = require("../../models/ledgerModels/bankLedger");
const CheckBank = require("../../middleware/checkBank");
const BankBalance = require("../../models/bankModel/bankBalance");
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
          bank: bank_id,
        })
          .populate("mainHeadOfAccount", "headOfAccount")
          .populate("subHeadOfAccount", "headOfAccount")
          .populate("incomeHeadOfAccount", "headOfAccount");
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

      const lastEntry = bankLedgerData[bankLedgerData.length - 1];
      if (!lastEntry) {
        return res.status(400).json({ message: "No data found" });
      }

      bankLedgerData = bankLedgerData.map((document) => ({
        ...document.toObject(),
        date: document.date?.toLocaleDateString("en-GB").replace(/\//g, "-"),
        _headOfAccount:
          document.credit === undefined
            ? document.mainHeadOfAccount?.headOfAccount || document.subHeadOfAccount?.headOfAccount
            : document.incomeHeadOfAccount?.headOfAccount,
      }));

      ledgerTemplateHtml = ledgerTemplateHtml.replace(
        "{{ledgerHeading}}",
        "Bank Ledger"
      );
      ledgerTemplateHtml = ledgerTemplateHtml.replace(
        "{{ledgerDetail}}",
        getLedgerDetailHtml({
          "BANK NAME": bankName,
          "ACCOUNT NUMBER": bank_account,
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
          "STARTING BALANCE": balance.toString(),
          "CLOSING BALANCE": lastEntry.balance,
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
              label: "Cheque No.",
              key: "chequeNo",
            },
            {
              label: "Challan No.",
              key: "challanNo",
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
          data: bankLedgerData,
        })
      );
      const pdfBuffer = await generatePdf(ledgerTemplateHtml);

      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Content-Disposition": 'attachment; filename="bank-ledger.pdf"',
      });
      return res.end(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Failed to generate PDF");
    }
  },
};
