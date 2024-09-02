const PDFDocument = require('pdfkit');
const fs = require('fs');
const BankLedger = require('../../models/ledgerModels/bankLedger');
const FixedAmount = require('../../models/fixedAmountModel/fixedAmount');
const CheckBank = require('../../middleware/checkBank');
const BankBalance = require('../../models/bankModel/bankBalance');

module.exports = {
    generatePDF: async (req, res) => {
        try {
            const { bank_account } = req.body;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start Date and EndDate are Required" });
              }

            let bankLedgerData;
            let latestBalanceDoc;
            let balance;
            let totalBalance;
            let actualBalance;

            if (bank_account) {
                let { bank_id, bank_name, bank_account_number } = await CheckBank.checkBank(req, res, bank_account);
                bankLedgerData = await BankLedger.find({
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    },
                    bank: bank_id
                });
                totalBalance = await BankBalance.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalBalance: { $sum: "$balance" }
                        }
                    }
                ]);
                if (totalBalance.length > 0) {
                    latestBalanceDoc = await BankBalance.findOne({ bank: bank_id }).exec();
                    balance = latestBalanceDoc ? latestBalanceDoc.balance : 0;
                }
            } else {
                return res.status(400).json({ message: "Provide Bank Account Number" });
            }

            const lastEntry = bankLedgerData[bankLedgerData.length - 1];
            if (!lastEntry) {
                return res.status(400).json({ message: "No data found" });
            }

            const monthEnding = new Date(endDate).toLocaleString('default', { month: 'long', year: 'numeric' });

            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream('bankLedgerPdf.pdf'));
            const containerWidth = 500;
            const pageMargin = 50;
            let headerOffsetY = 50; 

            doc.font('Helvetica');

            doc.fontSize(11).text('STARTING BALANCE', pageMargin, 110);
            doc.rect(pageMargin, 130, 140, 20).stroke();
            doc.text(balance.toString(), pageMargin + 10, 135);

            doc.fontSize(11).text('ACCOUNT NUMBER', pageMargin, 50);
            doc.rect(pageMargin, 70, 140, 20).stroke();
            doc.text(bank_account, pageMargin + 10, 75);

            doc.fontSize(11).text('MONTH ENDING', 200, 50);
            doc.rect(200, 70, 140, 20).stroke();
            doc.text(monthEnding, 210, 75);

            doc.fontSize(11).text('TOTAL ADJUSTED BALANCE', 200, 110);
            doc.rect(200, 130, 140, 20).stroke();
            doc.text(lastEntry.balance, 210, 135);

            headerOffsetY = 170; 
            doc.fontSize(8).fillColor('white').rect(pageMargin, headerOffsetY, containerWidth, 20).fill('#3f4d61');
            doc.fillColor('white').text('Date', pageMargin + 3, headerOffsetY + 5, { width: 40, align: 'center' });
            doc.text('Head of Account', pageMargin + 43, headerOffsetY + 5, { width: 70, align: 'center' });
            doc.text('Particulars', pageMargin + 113, headerOffsetY + 5, { width: 70, align: 'center' });
            doc.text('Cheque No.', pageMargin + 183, headerOffsetY + 5, { width: 60, align: 'center' });
            doc.text('Challan No.', pageMargin + 243, headerOffsetY + 5, { width: 60, align: 'center' });
            doc.text('Voucher No.', pageMargin + 303, headerOffsetY + 5, { width: 60, align: 'center' });
            doc.text('Debit', pageMargin + 363, headerOffsetY + 5, { width: 45, align: 'center' });
            doc.text('Credit', pageMargin + 408, headerOffsetY + 5, { width: 45, align: 'center' });
            doc.text('Balance', pageMargin + 453, headerOffsetY + 5, { width: 45, align: 'center' });

            const startY = headerOffsetY + 20;
            let rowHeight = 20;
            let currentY = startY;

            bankLedgerData.forEach((entry, rowIndex) => {
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
                    entry.balance || '0'
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
    }
}
