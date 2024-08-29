const PDFDocument = require('pdfkit');
const fs = require('fs');
const BankLedger = require('../../models/ledgerModels/bankLedger');
const FixedAmount = require('../../models/fixedAmountModel/fixedAmount');
const CheckBank = require('../../middleware/checkBank');
const BankBalance = require('../../models/bankModel/bankBalance');
const GeneralLedger = require('../../models/ledgerModels/generalLedger');


module.exports = {
    generatePDF: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start Date and EndDate are Required" });
              }

            let generalLedgerData;
            let totalBalance;
            let actualBalance;
            let startingBalance;
            let balance;

            generalLedgerData = await GeneralLedger.find({
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            });

            totalBalance = await BankBalance.aggregate([
                {
                    $group: {
                        _id: null,
                        totalBalance: { $sum: '$balance' },
                    },
                },
            ]);

            latestBalanceCash = await FixedAmount.findOne({})
            .sort({ cashOpeningBalance: -1 })
            .exec();

            actualBalance = parseInt(totalBalance[0].totalBalance) + parseInt(latestBalanceCash.cashOpeningBalance);

            latestBalanceCash = await FixedAmount.findOne({})
                .sort({ cashOpeningBalance: -1 })
                .exec();

            const lastEntry = generalLedgerData[generalLedgerData.length - 1];
            balance = lastEntry?.balance || 0;

            const monthEnding = new Date(endDate).toLocaleString('default', { month: 'long', year: 'numeric' });

            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream('generalLedgerPdf.pdf'));

            const containerWidth = 500;
            const pageMargin = 50;

            doc.font('Helvetica');

            if (actualBalance !== 0) {
                doc.fontSize(11).text('STARTING BALANCE', pageMargin, 50);
                doc.rect(pageMargin, 70, 140, 20).stroke();
                doc.text(actualBalance, pageMargin + 10, 75);
            }

            doc.fontSize(11).text('MONTH ENDING', actualBalance !== 0 ? 200 : 50, 50);
            doc.rect(actualBalance !== 0 ? 200 : 50, 70, 140, 20).stroke();
            doc.text(monthEnding, (actualBalance !== 0 ? 210 : 60), 75);

            doc.fontSize(11).text('ADJUSTED BALANCE', actualBalance !== 0 ? 350 : 200, 50);
            doc.rect(actualBalance !== 0 ? 350 : 200, 70, 140, 20).stroke();
            doc.text(balance.toString(), (actualBalance !== 0 ? 360 : 210), 75);

            doc.fontSize(8).fillColor('white').rect(pageMargin, 130, containerWidth, 20).fill('#3f4d61');
            doc.fillColor('white').text('Date', pageMargin + 3, 135, { width: 40, align: 'center' });
            doc.text('Head of Account', pageMargin + 43, 135, { width: 70, align: 'center' });
            doc.text('Particulars', pageMargin + 113, 135, { width: 70, align: 'center' });
            doc.text('Cheque No.', pageMargin + 183, 135, { width: 60, align: 'center' });
            doc.text('Challan No.', pageMargin + 243, 135, { width: 60, align: 'center' });
            doc.text('Voucher No.', pageMargin + 303, 135, { width: 60, align: 'center' });
            doc.text('Debit', pageMargin + 363, 135, { width: 45, align: 'center' });
            doc.text('Credit', pageMargin + 408, 135, { width: 45, align: 'center' });
            doc.text('Balance', pageMargin + 453, 135, { width: 45, align: 'center' });

            const startY = 150;
            let rowHeight = 20;
            let currentY = startY;

            generalLedgerData.forEach((entry, rowIndex) => {
                const rowFill = rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff';
                doc.fillColor(rowFill).rect(pageMargin, currentY, containerWidth, rowHeight).fill();

                doc.fillColor('black').fontSize(6);
                const row = [
                    entry.date.toISOString().split('T')[0],
                    entry.headOfAccount,
                    entry.particular,
                    entry.chequeNo || '',
                    entry.challanNo || '',
                    entry.voucherNo || '',
                    entry.debit || '0',
                    entry.credit || '0',
                    entry.balance || '0',
                ];

                row.forEach((cell, cellIndex) => {
                    let cellWidth;
                    let cellX;

                    switch (cellIndex) {
                        case 0:
                            cellWidth = 40;
                            cellX = pageMargin + 3;
                            break;
                        case 1:
                            cellWidth = 70;
                            cellX = pageMargin + 43;
                            break;
                        case 2:
                            cellWidth = 70;
                            cellX = pageMargin + 113;
                            break;
                        case 3:
                            cellWidth = 60;
                            cellX = pageMargin + 183;
                            break;
                        case 4:
                            cellWidth = 60;
                            cellX = pageMargin + 243;
                            break;
                        case 5:
                            cellWidth = 60;
                            cellX = pageMargin + 303;
                            break;
                        case 6:
                            cellWidth = 45;
                            cellX = pageMargin + 363;
                            break;
                        case 7:
                            cellWidth = 45;
                            cellX = pageMargin + 408;
                            break;
                        case 8:
                            cellWidth = 45;
                            cellX = pageMargin + 453;
                            break;
                    }

                    doc.text(cell, cellX, currentY + 5, { width: cellWidth, align: 'center' });
                });

                currentY += rowHeight;
            });

            doc.end();
            doc.pipe(res);
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Failed to generate PDF');
        }
    },
};
