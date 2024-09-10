const PDFDocument = require('pdfkit');
const fs = require('fs');
const FixedAmount = require('../../models/fixedAmountModel/fixedAmount');
const IncomeStatement = require('../../models/incomeStatementModel/incomeStatement');
const LiabilitiesSchema = require('../../models/incomeModels/libility/libility');
const GeneralLedger = require('../../models/ledgerModels/generalLedger');
const IncomeHeadOfAccount = require('../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount');

module.exports = {
    generatePDF: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const { reserve_fund, accumulated_surplus, share_deposit_money, trade_and_other_payable, provision_for_taxation } = req.body;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start Date and End Date are required." });
            }

            function formatForDisplay(amount) {
                return amount < 0 ? `(${Math.abs(amount).toFixed(2)})` : amount.toFixed(2);
            }

            const sdate = new Date(startDate);
            const formattedSDate = sdate.toLocaleDateString('en-CA');

            const edate = new Date(endDate);
            const formattedEDate = edate.toLocaleDateString('en-CA');

            const doc = new PDFDocument();

            const writeStream = fs.createWriteStream('balanceSheet.pdf');
            doc.pipe(writeStream);

            doc.pipe(res);

            doc.font('Helvetica');

            let currentY = 100; 
            const pageMargin = 50;
            const containerWidth = 500; 
            const rowHeight = 20; 
            let totalIncome = 0;


            doc.fontSize(11).text('START DATE', 50, currentY);
            doc.rect(50, currentY + 20, 140, 20).stroke();
            doc.text(formattedSDate, 60, currentY + 25);

            doc.fontSize(11).text('END DATE', 400, currentY);
            doc.rect(400, currentY + 20, 140, 20).stroke();
            doc.text(formattedEDate, 410, currentY + 25);


            currentY += 70;

            doc.moveTo(pageMargin, currentY)
                .lineTo(pageMargin + containerWidth, currentY)
                .stroke();

            currentY += 30;


            const fixedAmount = await FixedAmount.findOne().exec();


            doc.fontSize(17).font('Helvetica-Bold').fillColor('black').text('Share Capital and Liabilities', pageMargin + 0, currentY, { width: containerWidth, align: 'center' });

            currentY += 30;

            doc.fontSize(13).fillColor('black').text('Share Capital', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(fixedAmount.shareCapital), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            const incomeStatement = await IncomeStatement.findOne({ startDate: formattedSDate, endDate: formattedEDate }).exec();

            let actualReserveFund = parseInt(incomeStatement.reservedFund) + (reserve_fund ? parseInt(reserve_fund) : 0);

            doc.fontSize(13).fillColor('black').text('Reserve Fund', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(actualReserveFund), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            let actualAccumulatedSurplus = parseInt(incomeStatement.surplusOfTheYear) + (accumulated_surplus ? parseInt(accumulated_surplus) : 0);

            doc.fontSize(13).fillColor('black').text('Accumulated Surplus', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(actualAccumulatedSurplus), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 30;

            const totalShareCapitalandLiabilities = parseInt(fixedAmount.shareCapital) + parseInt(actualReserveFund) + parseInt(actualAccumulatedSurplus)

            doc.fontSize(13).fillColor('black').text('Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(totalShareCapitalandLiabilities), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            doc.moveTo(pageMargin, currentY)
                .lineTo(pageMargin + containerWidth, currentY) 
                .stroke();

            currentY += 30;

            doc.fontSize(17).fillColor('black').text('Non-Current Liabilities', pageMargin + 0, currentY, { width: containerWidth, align: 'center' });

            currentY += 30;

            const liabilityAccounts = await LiabilitiesSchema.find({}, 'headOfAccount');
            const liabilityAccountIds = liabilityAccounts.map(acc => acc.headOfAccount.toString());


            const liabilityHeadMap = {};

            liabilityAccountIds.forEach(id => {
                liabilityHeadMap[id] = 0;
            });

            const ledgerRecords = await GeneralLedger.find({
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                },
                credit: { $gt: 0 }
            });

            if (ledgerRecords.length === 0) {
                return res.status(404).json({ message: "No ledger records found for the specified date range." });
            }

            ledgerRecords.forEach(record => {
                const { incomeHeadOfAccount, credit } = record;

                const incomeHeadOfAccountStr = incomeHeadOfAccount.toString();

                if (liabilityAccountIds.includes(incomeHeadOfAccountStr)) {
                    liabilityHeadMap[incomeHeadOfAccountStr] += credit; 
                }
            });


            const idsToMerge = [
                '66c59792b5f2063037ba5671',
                '66c597aeb5f2063037ba567c',
                '66c597cab5f2063037ba5693'
            ];


            let totalAmount = 0;
            idsToMerge.forEach(id => {
                if (liabilityHeadMap[id]) {
                    totalAmount += liabilityHeadMap[id];
              
                    liabilityHeadMap[id] = 0;
                }
            });


            const representativeId = idsToMerge[0];


            const liabilityHeadOfAccountAmount = [
                {
                    id: representativeId,
                    amount: totalAmount
                }
            ];


            const remainingLiabilityHeadOfAccountAmount = liabilityAccountIds
                .filter(id => !idsToMerge.includes(id))
                .map(id => ({
                    id,
                    amount: liabilityHeadMap[id]
                }));


            const finalResult = liabilityHeadOfAccountAmount.concat(remainingLiabilityHeadOfAccountAmount);
     

            for (const amount of finalResult) {
                const nameHeadOfAccount = await IncomeHeadOfAccount.findById(amount.id);
                if (nameHeadOfAccount) {

                    const displayName = nameHeadOfAccount.headOfAccount === 'Bank Profit' ? 'Return on Deposit' : nameHeadOfAccount.headOfAccount;
            
                    totalIncome += amount.amount;
            
                    const rowFill = currentY % 2 === 0 ? '#f9f9f9' : '#ffffff';
                    doc.fillColor(rowFill).rect(pageMargin, currentY, containerWidth, rowHeight).fill();
            
                    doc.fillColor('black').fontSize(13);
                    doc.text(displayName, pageMargin + 30, currentY + 5, { width: 200, align: 'left' });
                    doc.text(formatForDisplay(amount.amount), pageMargin + 330, currentY + 5, { width: 70, align: 'center' });
            
                    currentY += rowHeight;
                }
            }

            currentY += 20;

            doc.fontSize(13).fillColor('black').text('Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(totalIncome), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 30;

            doc.moveTo(pageMargin, currentY)
            .lineTo(pageMargin + containerWidth, currentY)
            .stroke();

            currentY += 30;

            doc.fontSize(17).fillColor('black').text('Current Liabilities', pageMargin + 0, currentY, { width: containerWidth, align: 'center' });

            currentY += 30;

            const shareMoneyRecords = await GeneralLedger.find({ headOfAccount: 'Share Money' }).exec();

            const totalCredit = shareMoneyRecords.reduce((sum, record) => sum + (record.credit || 0), 0);

            const actualShareDepositMoney = parseInt(totalCredit) + (share_deposit_money ? parseInt(share_deposit_money) : 0);
            
            doc.fontSize(13).fillColor('black').text('Share Deposit Money', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(actualShareDepositMoney), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;
            
            doc.fontSize(13).fillColor('black').text('Trade and Other Payable', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text((trade_and_other_payable ? parseInt(trade_and_other_payable) : 0), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            doc.fontSize(13).fillColor('black').text('Position For Taxation', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text((provision_for_taxation ? parseInt(provision_for_taxation) : 0), pageMargin + 330, currentY, { width: 70, align: 'center' });
            
            currentY += 30;

            const totalCurrentLiabilities = parseInt(actualShareDepositMoney) + parseInt(trade_and_other_payable) + parseInt(provision_for_taxation)

            doc.fontSize(13).fillColor('black').text('Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(totalCurrentLiabilities), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 30;

            doc.moveTo(pageMargin, currentY)
            .lineTo(pageMargin + containerWidth, currentY) 
            .stroke();
            
            currentY += 5;
            
            doc.moveTo(pageMargin, currentY)
            .lineTo(pageMargin + containerWidth, currentY) 
            .stroke();


            doc.end();

            writeStream.on('finish', () => {
                console.log('PDF saved successfully');
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};
