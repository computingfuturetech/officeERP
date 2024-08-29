const PDFKit = require('pdfkit');
const fs = require('fs');
const path = require('path');
const BankLedger = require("../../models/ledgerModels/bankLedger");

module.exports = {
  generatePDF: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const doc = new PDFKit({
        layout: 'portrait',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });
      const outputPath = path.join(__dirname, "../../public/ledger.pdf");
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      doc.fontSize(24).text('Account Sheet', 100, 50, { align: 'center' });
      doc.moveDown(1);

      const query = {};
      if (startDate && endDate) {
        query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      const bankLedgerRecords = await BankLedger.find(query).populate("bank", "bankName accountNo");

      let bankDetails = {};
      if (bankLedgerRecords.length > 0) {
        const bank = bankLedgerRecords[0].bank;
        bankDetails = {
          bankName: bank.bankName,
          accountNo: bank.accountNo
        };
      }

      doc.fontSize(18).text(`Account Name: ${bankDetails.bankName || ''}`, 100, doc.y, { align: 'left' });
      doc.text(`Account Number: ${bankDetails.accountNo || ''}`, 100, doc.y + 20, { align: 'left' });
      doc.moveDown(1);

      const tableWidth = 500;
      const columnWidth = tableWidth / 9;
      const tableHeaderFontSize = 12;
      const tableBodyFontSize = 10;

      doc.fontSize(tableHeaderFontSize)
        .text('Date', 100, doc.y, { width: columnWidth, align: 'center' })
        .text('Head of Account', 100 + columnWidth, doc.y, { width: columnWidth, align: 'center' })
        .text('Particulars', 100 + columnWidth * 2, doc.y, { width: columnWidth, align: 'center' })
        .text('Cheque Number', 100 + columnWidth * 3, doc.y, { width: columnWidth, align: 'center' })
        .text('Challan Number', 100 + columnWidth * 4, doc.y, { width: columnWidth, align: 'center' })
        .text('Voucher Number', 100 + columnWidth * 5, doc.y, { width: columnWidth, align: 'center' })
        .text('Debit', 100 + columnWidth * 6, doc.y, { width: columnWidth, align: 'center' })
        .text('Credit', 100 + columnWidth * 7, doc.y, { width: columnWidth, align: 'center' })
        .text('Balance', 100 + columnWidth * 8, doc.y, { width: columnWidth, align: 'center' });
      doc.moveDown(0.5);

      const drawLine = (y) => {
        doc.strokeColor('#000').moveTo(100, y).lineTo(100 + tableWidth, y).stroke();
      };
      drawLine(doc.y);

      let yPosition = doc.y + 10;
      bankLedgerRecords.forEach(data => {
        doc.fontSize(tableBodyFontSize)
          .text(new Date(data.date).toLocaleDateString(), 100, yPosition, { width: columnWidth, align: 'center' })
          .text(data.headOfAccount, 100 + columnWidth, yPosition, { width: columnWidth, align: 'center' })
          .text(data.particular, 100 + columnWidth * 2, yPosition, { width: columnWidth, align: 'center' })
          .text(data.chequeNo, 100 + columnWidth * 3, yPosition, { width: columnWidth, align: 'center' })
          .text(data.challanNo, 100 + columnWidth * 4, yPosition, { width: columnWidth, align: 'center' })
          .text(data.voucherNo, 100 + columnWidth * 5, yPosition, { width: columnWidth, align: 'center' })
          .text(data.debit || 'N/A', 100 + columnWidth * 6, yPosition, { width: columnWidth, align: 'center' })
          .text(data.credit || 'N/A', 100 + columnWidth * 7, yPosition, { width: columnWidth, align: 'center' })
          .text(data.balance, 100 + columnWidth * 8, yPosition, { width: columnWidth, align: 'center' });
        yPosition += 20;
        drawLine(yPosition);
      });

      doc.end();

      writeStream.on('finish', () => {
        res.setHeader("Content-type", "application/pdf");
        fs.createReadStream(outputPath).pipe(res);
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF");
    }
  }
};