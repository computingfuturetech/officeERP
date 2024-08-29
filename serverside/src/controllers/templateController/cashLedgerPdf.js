const PDFDocument = require('pdfkit');
const fs = require('fs');
const FixedAmount = require('../../models/fixedAmountModel/fixedAmount');
const CashLedger = require('../../models/ledgerModels/cashBookLedger');

module.exports = {
    generatePDF: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start Date and EndDate are Required" });
            }

            let cashLedgerData = await CashLedger.find({
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            });

            let latestBalanceCash = await FixedAmount.findOne({})
                .sort({ cashOpeningBalance: -1 })
                .exec();

            const startingBalance = latestBalanceCash?.cashOpeningBalance || 0;
            const lastEntry = cashLedgerData[cashLedgerData.length - 1];
            const balance = lastEntry?.balance || 0;

            const monthEnding = new Date(endDate).toLocaleString('default', { month: 'long', year: 'numeric' });

            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream('cashLedgerPdf.pdf'));

            const pageMargin = 50;
            const tableWidth = 510;
            const startY = 100;

            doc.font('Helvetica');

            doc.fontSize(11).text('STARTING BALANCE', pageMargin, 50);
            doc.rect(pageMargin, 70, 140, 20).stroke();
            doc.text(startingBalance.toString(), pageMargin + 10, 75);

            doc.fontSize(11).text('MONTH ENDING', 200, 50);
            doc.rect(200, 70, 140, 20).stroke();
            doc.text(monthEnding, 210, 75);

            doc.fontSize(11).text('ADJUSTED BALANCE', 350, 50);
            doc.rect(350, 70, 140, 20).stroke();
            doc.text(balance.toString(), 360, 75);

            doc.fontSize(8).fillColor('white').rect(pageMargin, 129, tableWidth, 20).fill('#3f4d61');
            doc.fillColor('white').text('Date', pageMargin + 5, 135, { width: 50, align: 'center' });
            doc.text('Head of Account', pageMargin + 55, 135, { width: 100, align: 'center' });
            doc.text('Particulars', pageMargin + 155, 135, { width: 100, align: 'center' });
            doc.text('Voucher No.', pageMargin + 255, 135, { width: 80, align: 'center' });
            doc.text('Debit', pageMargin + 335, 135, { width: 60, align: 'center' });
            doc.text('Credit', pageMargin + 395, 135, { width: 60, align: 'center' });
            doc.text('Balance', pageMargin + 455, 135, { width: 60, align: 'center' });

            let currentY = 150; 

            cashLedgerData.forEach((entry, rowIndex) => {
                const rowFill = rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff';
                doc.fillColor(rowFill).rect(pageMargin, currentY, tableWidth, 20).fill();

                doc.fillColor('black').fontSize(7);
                const row = [
                    entry.date.toISOString().split('T')[0],
                    entry.headOfAccount,
                    entry.particular,
                    entry.voucherNo || '',
                    entry.debit || '0',
                    entry.credit || '0',
                    entry.balance || '0',
                ];

                const columnWidths = [50, 100, 100, 80, 60, 60, 60];
                let cellX = pageMargin;

                row.forEach((cell, cellIndex) => {
                    const cellWidth = columnWidths[cellIndex];
                    doc.text(cell, cellX + 5, currentY + 5, { width: cellWidth, align: 'center' });
                    cellX += cellWidth;
                });

                currentY += 20;  
            });

            doc.end();
            doc.pipe(res);
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Failed to generate PDF');
        }
    },
};
