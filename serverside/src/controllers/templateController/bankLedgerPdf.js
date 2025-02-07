const fs = require("fs");
const BankLedger = require("../../models/ledgerModels/bankLedger");
const FixedAmount = require("../../models/fixedAmountModel/fixedAmount");
const CheckBank = require("../../middleware/checkBank");
const BankBalance = require("../../models/bankModel/bankBalance");
const puppeteer = require("puppeteer");
const path = require("path");
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
      let actualBalance;
      let bank_id;
      let bankName;

      if (bank_account) {
        let bankDetails = await CheckBank.checkBank(
          req,
          res,
          bank_account
        );
        bank_id = bankDetails.bank_id;
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
        });
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

      const monthEnding = new Date(endDate).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      bankLedgerData = bankLedgerData.map(document => ({ ...document.toObject(), date: document.date.toISOString().split("T")[0] }));

      ledgerTemplateHtml = ledgerTemplateHtml.replace(
        "{{ledgerHeading}}",
        "Bank Ledger"
      );
      ledgerTemplateHtml = ledgerTemplateHtml.replace(
        "{{ledgerDetail}}",
        getLedgerDetailHtml({
          "BANK NAME": bankName,
          "ACCOUNT NUMBER": bank_account,
          "START DATE": startDate.toISOString().split("T")[0],
          "END DATE": endDate.toISOString().split("T")[0],
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
            },
            {
              label: "Head of Account",
              key: "headOfAccount",
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

async function generatePdf(html) {
  try {
    // Launch browser with specific arguments to handle PDF generation
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Create new page
    const page = await browser.newPage();

    // Set content with proper encoding
    await page.setContent(html, {
      waitUntil: "networkidle0",
      encoding: "utf-8",
    });

    // Generate PDF with buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      preferCSSPageSize: true,
    });

    // Close browser
    await browser.close();

    // returning the pdfBuffer
    return pdfBuffer;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw new Error("Error while generating pdf");
  }
}

function getLedgerDetailHtml(data) {
  let html = "";
  Object.keys(data).forEach((key) => {
    if (data[key]) {
      let value = data[key];
      html += `
        <div> ${key} </div>
        <div> ${value} </div>
      `;
    }
  });
  return html;
}

function getLedgerTableHtml({ columns, data }) {
  let html = `
    <table>
      <thead> 
        <tr>
          ${getTableHeaderCells()}
        </tr>
      </thead>
      <tbody>
        ${getTableBodyRows()}
      </tbody>
    </table>
  `;

  function getTableHeaderCells() {
    let html = ``;
    for (const column of columns) {
      html += `<th>${column.label}</th>`
    }
    return html;
  }

  function getTableBodyRows() {
    let html = ``;
    for (const document of data) {
      html += `
        <tr>
          ${getTableBodyRowCells(document)}
        </tr>
      `;
    }

    function getTableBodyRowCells(document) {
      let html = ``;
      for (const column of columns) {
        html += `
          <td>
            ${document[column.key] || ""}
          </td>
        `;
      }
      return html;
    }

    return html;
  }

  return html;
}