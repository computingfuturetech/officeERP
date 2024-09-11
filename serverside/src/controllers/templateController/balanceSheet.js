const PDFDocument = require('pdfkit');
const fs = require('fs');
const FixedAmount = require('../../models/fixedAmountModel/fixedAmount');
const IncomeStatement = require('../../models/incomeStatementModel/incomeStatement');
const LiabilitiesSchema = require('../../models/incomeModels/libility/libility');
const GeneralLedger = require('../../models/ledgerModels/generalLedger');
const IncomeHeadOfAccount = require('../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount');
const OperatingFixedAssets = require('../../models/operatingFixedAssetsModels/operatingFixedAssets');
const MainExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const CashLedger = require('../../models/ledgerModels/cashBookLedger');
const BankLedger = require('../../models/ledgerModels/bankLedger');

module.exports = {
    generatePDF: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const { reserve_fund, accumulated_surplus, share_deposit_money, trade_and_other_payable,
                provision_for_taxation, intangible_assets, purchase_of_land, cost_of_land_developement,
                long_term_security_deposit, loan_and_advances } = req.body;

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

            doc.fontSize(20).fillColor('black').text('Capital and Liabilities', pageMargin + 0, currentY, { width: containerWidth, align: 'center' });

            currentY += 30;


            const fixedAmount = await FixedAmount.findOne().exec();


            doc.fontSize(17).fillColor('black').text('Share Capital and Liabilities', pageMargin + 0, currentY, { width: containerWidth, align: 'center' });

            currentY += 30;

            doc.fontSize(13).fillColor('black').text('Share Capital', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(fixedAmount.shareCapital), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 20;

            const incomeStatement = await IncomeStatement.findOne({ startDate: formattedSDate, endDate: formattedEDate }).exec();

            let actualReserveFund = parseInt(incomeStatement.reservedFund) + (reserve_fund ? parseInt(reserve_fund) : 0);

            doc.fontSize(13).fillColor('black').text('Reserve Fund', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(actualReserveFund), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 20;

            let actualAccumulatedSurplus = parseInt(incomeStatement.surplusOfTheYear) + (accumulated_surplus ? parseInt(accumulated_surplus) : 0);

            doc.fontSize(13).fillColor('black').text('Accumulated Surplus', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(actualAccumulatedSurplus), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 30;

            const totalShareCapitalandLiabilities = parseInt(fixedAmount.shareCapital) + parseInt(actualReserveFund) + parseInt(actualAccumulatedSurplus)

            doc.fontSize(13).fillColor('black').text('Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(totalShareCapitalandLiabilities), pageMargin + 330, currentY, { width: 70, align: 'right' });

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

            const aggregatedHeadOfAccountMap = {};

            for (const [id, amount] of Object.entries(liabilityHeadMap)) {
                const nameHeadOfAccount = await IncomeHeadOfAccount.findById(id);
                if (nameHeadOfAccount) {
                    const displayName = nameHeadOfAccount.headOfAccount === 'Bank Profit' ? 'Return on Deposit' : nameHeadOfAccount.headOfAccount;

                    if (!aggregatedHeadOfAccountMap[displayName]) {
                        aggregatedHeadOfAccountMap[displayName] = 0;
                    }
                    aggregatedHeadOfAccountMap[displayName] += amount;
                }
            }

            for (const [displayName, totalAmount] of Object.entries(aggregatedHeadOfAccountMap)) {
                totalIncome += totalAmount;

                const rowFill = currentY % 2 === 0 ? '#f9f9f9' : '#ffffff';
                doc.fillColor(rowFill).rect(pageMargin, currentY, containerWidth, rowHeight).fill();

                doc.fillColor('black').fontSize(13);
                doc.text(displayName, pageMargin + 30, currentY + 5, { width: 200, align: 'left' });
                doc.text(formatForDisplay(totalAmount), pageMargin + 330, currentY + 5, { width: 70, align: 'right' });

                currentY += rowHeight;
            }

            currentY += 20;

            doc.fontSize(13).fillColor('black').text('Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(totalIncome), pageMargin + 330, currentY, { width: 70, align: 'right' });

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
            doc.text(formatForDisplay(actualShareDepositMoney), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 20;

            doc.fontSize(13).fillColor('black').text('Trade and Other Payable', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text((trade_and_other_payable ? parseInt(trade_and_other_payable) : 0), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 20;

            doc.fontSize(13).fillColor('black').text('Position For Taxation', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text((provision_for_taxation ? parseInt(provision_for_taxation) : 0), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 30;

            const totalCurrentLiabilities = parseInt(actualShareDepositMoney) + parseInt(trade_and_other_payable) + parseInt(provision_for_taxation)

            doc.fontSize(13).fillColor('black').text('Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(totalCurrentLiabilities), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 30;

            doc.moveTo(pageMargin, currentY)
                .lineTo(pageMargin + containerWidth, currentY)
                .stroke();

            const grandTotalCapitalAndLiabilities = parseInt(totalShareCapitalandLiabilities) + parseInt(totalIncome) + parseInt(totalCurrentLiabilities);

            currentY += 5;

            doc.fontSize(13).fillColor('black').text('Grand Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(grandTotalCapitalAndLiabilities), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 14;

            doc.moveTo(pageMargin, currentY)
                .lineTo(pageMargin + containerWidth, currentY)
                .stroke();

            doc.addPage();

            currentY = 50;

            doc.fontSize(20).fillColor('black').text('Assets', pageMargin + 0, currentY, { width: containerWidth, align: 'center' });

            currentY += 30;

            doc.fontSize(17).fillColor('black').text('Non-Current Assets', pageMargin + 0, currentY, { width: containerWidth, align: 'center' });

            currentY += 30;

            const operatingFixedAssets = await OperatingFixedAssets.findOne().exec();
            const totalAmountt = operatingFixedAssets ?
                Object.values(operatingFixedAssets.toObject())
                    .filter(value => typeof value === 'number')
                    .reduce((sum, value) => sum + value, 0) : 0;


            doc.fontSize(13).fillColor('black').text('Operating Fixed Assets', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(totalAmountt), pageMargin + 300, currentY, { width: 100, align: 'right' });

            currentY += 20;

            doc.fontSize(13).fillColor('black').text('Intangible Assets', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(intangible_assets), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 20;

            const getPurchaseOfLand = await GeneralLedger.find({ headOfAccount: 'Purchase of land' }).exec();

            let totalDebitPurchaseOfLand = 0;

            if (getPurchaseOfLand.length > 0) {
                totalDebitPurchaseOfLand = getPurchaseOfLand.reduce((sum, record) => sum + (record.debit || 0), 0);
            } else {
                totalDebitPurchaseOfLand = 0;
            }

            let tpol = parseInt(totalDebitPurchaseOfLand) + (purchase_of_land ? parseInt(purchase_of_land) : 0)

            doc.fontSize(13).fillColor('black').text('Land at Cost', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(tpol), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 20;

            const getDevelopmentExpenditure = await GeneralLedger.find({ headOfAccount: 'Development Expenditure' }).exec();

            let totalDevelopmentExpenditure = 0;

            if (getDevelopmentExpenditure.length > 0) {
                totalDevelopmentExpenditure = getDevelopmentExpenditure.reduce((sum, record) => sum + (record.debit || 0), 0);
            } else {
                totalDevelopmentExpenditure = 0;
            }

            let tde = parseInt(totalDevelopmentExpenditure) + (cost_of_land_developement ? parseInt(cost_of_land_developement) : 0)

            doc.fontSize(13).fillColor('black').text('Cost of Land Developement', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(tde), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 20;

            let ltsd = long_term_security_deposit ? parseInt(long_term_security_deposit) : 0

            doc.fontSize(13).fillColor('black').text('Long Term Security Deposit', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(ltsd), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 30;

            const totalNonCurrentAssets = parseInt(totalAmountt) + parseInt(intangible_assets) + parseInt(tpol) + parseInt(tde) + parseInt(ltsd);

            doc.fontSize(13).fillColor('black').text('Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(totalNonCurrentAssets), pageMargin + 300, currentY, { width: 100, align: 'right' });

            currentY += 30;

            doc.moveTo(pageMargin, currentY)
                .lineTo(pageMargin + containerWidth, currentY)
                .stroke();

            currentY += 30;

            doc.fontSize(17).fillColor('black').text('Current Assets', pageMargin + 0, currentY, { width: containerWidth, align: 'center' });

            currentY += 30;

            let tlaa = loan_and_advances ? parseInt(loan_and_advances) : 0

            doc.fontSize(13).fillColor('black').text('Loan and Advances', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(tlaa), pageMargin + 330, currentY, { width: 70, align: 'right' });

            currentY += 20;

            let cashLedger = await CashLedger.findOne({ date: endDate }).exec();

            if (!cashLedger) {
                cashLedger = await CashLedger.findOne({
                    date: { $lt: endDate }
                }).sort({ date: -1 }).exec();
            }

            let cashbalance = 0;

            if (cashLedger) {
                cashbalance = cashLedger.balance;
            } else {
                console.log("No CashLedger entry found.");
            }

            doc.fontSize(13).fillColor('black').text('Cash in Hand', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(cashbalance), pageMargin + 310, currentY, { width: 90, align: 'right' });

            currentY += 20;

            let bankLedger = await BankLedger.findOne({ date: endDate }).exec();

            if (!bankLedger) {
                bankLedger = await BankLedger.findOne({
                    date: { $lt: endDate }
                }).sort({ date: -1 }).exec();
            }

            let bankBalance = 0;

            if (bankLedger) {
                bankBalance = bankLedger.balance;
            } else {
                console.log("No BankLedger entry found.");
            }


            doc.fontSize(13).fillColor('black').text('Bank Balance', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(bankBalance), pageMargin + 310, currentY, { width: 90, align: 'right' });

            currentY += 30;

            const totalCurrentAssets = parseInt(tlaa) + parseInt(cashbalance) + parseInt(bankBalance);

            doc.fontSize(13).fillColor('black').text('Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(totalCurrentAssets), pageMargin + 300, currentY, { width: 100, align: 'right' });

            currentY += 30;

            doc.moveTo(pageMargin, currentY)
                .lineTo(pageMargin + containerWidth, currentY)
                .stroke();

            const grandTotalAssets = parseInt(totalNonCurrentAssets) + parseInt(totalCurrentAssets);

            currentY += 5;

            doc.fontSize(13).fillColor('black').text('Grand Total', pageMargin + 30, currentY, { width: containerWidth / 2, align: 'left' });
            doc.text(formatForDisplay(grandTotalAssets), pageMargin + 300, currentY, { width: 100, align: 'right' });

            currentY += 14;

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
