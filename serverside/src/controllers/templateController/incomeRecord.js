const PDFDocument = require('pdfkit');
const IncomeHeadOfAccount = require('../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount');
const Income = require('../../models/incomeModels/income/income');
const GeneralLedger = require('../../models/ledgerModels/generalLedger');
const LiabilitiesSchema = require('../../models/incomeModels/libility/libility');
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const IncomeStatement = require('../../models/incomeStatementModel/incomeStatement');
const fs = require('fs');

module.exports = {
    generatePDF: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const { taxation,accumulated_surplus_brought_forward } = req.body;

            if (!startDate || !endDate) {
                return res.status(400).json({ message: "Start Date and End Date are required." });
            }

            const sdate = new Date(startDate);
            const formattedSDate = sdate.toLocaleDateString('en-CA');

            const edate = new Date(endDate);
            const formattedEDate = edate.toLocaleDateString('en-CA');

            const liabilityAccounts = await LiabilitiesSchema.find({}, 'headOfAccount');
            const liabilityAccountIds = liabilityAccounts.map(acc => acc.headOfAccount.toString());

            const ledgerRecords = await GeneralLedger.find({
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                },
                $or: [{ credit: { $exists: true } }, { debit: { $exists: true } }]
            });

            if (ledgerRecords.length === 0) {
                return res.status(404).json({ message: "No ledger records found for the specified date range." });
            }

            // ================= Income Section ===================
            const incomeHeadMap = {};
            ledgerRecords.forEach(record => {
                const { incomeHeadOfAccount, credit } = record;
                if (!incomeHeadOfAccount || liabilityAccountIds.includes(incomeHeadOfAccount.toString())) {
                    return;
                }
                if (incomeHeadMap[incomeHeadOfAccount]) {
                    incomeHeadMap[incomeHeadOfAccount] += credit;
                } else {
                    incomeHeadMap[incomeHeadOfAccount] = credit;
                }
            });

            const headOfAccountAmount = Object.keys(incomeHeadMap).map(id => ({
                id,
                amount: incomeHeadMap[id]
            }));

            // ================= Expense Section ===================
            const mainHeadMap = {};
            const subHeadMap = {};
            ledgerRecords.forEach(record => {
                const { mainHeadOfAccount, subHeadOfAccount, debit } = record;
                const expenseHeadOfAccount = mainHeadOfAccount || subHeadOfAccount;
                if (!expenseHeadOfAccount || liabilityAccountIds.includes(expenseHeadOfAccount.toString())) {
                    return;
                }
                if (mainHeadOfAccount) {
                    if (mainHeadMap[mainHeadOfAccount]) {
                        mainHeadMap[mainHeadOfAccount] += debit;
                    } else {
                        mainHeadMap[mainHeadOfAccount] = debit;
                    }
                }
                if (subHeadOfAccount) {
                    if (subHeadMap[subHeadOfAccount]) {
                        subHeadMap[subHeadOfAccount] += debit;
                    } else {
                        subHeadMap[subHeadOfAccount] = debit;
                    }
                }
            });

            const mainHeadOfAccountAmount = Object.keys(mainHeadMap).map(id => ({
                id,
                amount: mainHeadMap[id]
            }));
            const subHeadOfAccountAmount = Object.keys(subHeadMap).map(id => ({
                id,
                amount: subHeadMap[id]
            }));

            // ================= PDF Generation ===================
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=incomeAndExpenseRecord.pdf');
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream('incomeAndExpenseRecord.pdf'));
            doc.pipe(res);

            const containerWidth = 500;
            const pageMargin = 50;
            let currentY = 170;
            const rowHeight = 20;
            let totalIncome = 0;
            let totalExpense = 0;

            doc.font('Helvetica');

            // Start and End Date
            doc.fontSize(11).text('START DATE', pageMargin, 50);
            doc.rect(pageMargin, 70, 140, 20).stroke();
            doc.text(formattedSDate, pageMargin + 10, 75);

            doc.fontSize(11).text('END DATE', 400, 50);
            doc.rect(400, 70, 140, 20).stroke();
            doc.text(formattedEDate, 410, 75);

            // Income Header
            doc.fontSize(16).fillColor('white').rect(pageMargin, 120, containerWidth, 40).fill('#3f4d61');
            doc.fillColor('white').text('Income', pageMargin + 30, 135, { width: 200, align: 'center' });
            doc.text('Amount', pageMargin + 330, 135, { width: 70, align: 'center' });

            // Income Records
            for (const amount of headOfAccountAmount) {
                const nameHeadOfAccount = await IncomeHeadOfAccount.findById(amount.id);
                if (nameHeadOfAccount) {
                    // Check if headOfAccount is "BankProfit" and replace it with "Return on Deposit"
                    const displayName = nameHeadOfAccount.headOfAccount === 'Bank Profit' ? 'Return on Deposit' : nameHeadOfAccount.headOfAccount;
            
                    totalIncome += amount.amount;
            
                    const rowFill = currentY % 2 === 0 ? '#f9f9f9' : '#ffffff';
                    doc.fillColor(rowFill).rect(pageMargin, currentY, containerWidth, rowHeight).fill();
            
                    doc.fillColor('black').fontSize(10);
                    doc.text(displayName, pageMargin + 30, currentY + 5, { width: 200, align: 'center' });
                    doc.text(amount.amount.toFixed(2), pageMargin + 330, currentY + 5, { width: 70, align: 'center' });
            
                    currentY += rowHeight;
                }
            }
            

            // Move to next section
            currentY += 20;

            // Expense Header
            doc.fontSize(16).fillColor('white').rect(pageMargin, currentY, containerWidth, 40).fill('#3f4d61');
            doc.fillColor('white').text('Expense', pageMargin + 30, currentY + 15, { width: 200, align: 'center' });
            doc.text('Amount', pageMargin + 330, currentY + 15, { width: 70, align: 'center' });

            currentY += 40;

            // Expense Records - Main Head
            for (const amount of mainHeadOfAccountAmount) {
                const nameHeadOfAccount = await MainHeadOfAccount.findById(amount.id);
                if (nameHeadOfAccount) {
                    totalExpense += amount.amount;

                    const rowFill = currentY % 2 === 0 ? '#f9f9f9' : '#ffffff';
                    doc.fillColor(rowFill).rect(pageMargin, currentY, containerWidth, rowHeight).fill();

                    doc.fillColor('black').fontSize(10);
                    doc.text(nameHeadOfAccount.headOfAccount, pageMargin + 30, currentY + 5, { width: 200, align: 'center' });
                    doc.text(amount.amount.toFixed(2), pageMargin + 330, currentY + 5, { width: 70, align: 'center' });

                    currentY += rowHeight;
                }
            }

            // Expense Records - Sub Head
            for (const amount of subHeadOfAccountAmount) {
                const nameHeadOfAccount = await SubExpenseHeadOfAccount.findById(amount.id);
                if (nameHeadOfAccount) {
                    totalExpense += amount.amount;

                    const rowFill = currentY % 2 === 0 ? '#f9f9f9' : '#ffffff';
                    doc.fillColor(rowFill).rect(pageMargin, currentY, containerWidth, rowHeight).fill();

                    doc.fillColor('black').fontSize(10);
                    doc.text(nameHeadOfAccount.headOfAccount, pageMargin + 30, currentY + 5, { width: 200, align: 'center' });
                    doc.text(amount.amount.toFixed(2), pageMargin + 330, currentY + 5, { width: 70, align: 'center' });

                    currentY += rowHeight;
                }
            }

            currentY += 20;

            const netAmount = totalIncome - totalExpense;
            

            doc.fontSize(13).text('Total Income', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(totalIncome.toFixed(2), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            doc.fontSize(13).text('Total Expense', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(totalExpense.toFixed(2), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            function formatForDisplay(amount) {
                return amount < 0 ? `(${Math.abs(amount).toFixed(2)})` : amount.toFixed(2);
            }

            doc.fontSize(13).fillColor('black').text('Surplus for the year', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(formatForDisplay(netAmount), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            doc.fontSize(13).fillColor('black').text('Taxation', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(taxation, pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            const total=parseInt(netAmount)-parseInt(taxation);

            doc.fontSize(14).fillColor('black').text('Total', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(formatForDisplay(total), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            doc.moveTo(pageMargin, currentY + 10)
            .lineTo(pageMargin + containerWidth, currentY + 10)
            .stroke();

            currentY += 20;

            doc.fontSize(14).fillColor('black').text('Appropriation:', pageMargin + 30, currentY, { width: 200, align: 'center' });

            currentY += 20;

            const ten_percent = parseInt(total) * 0.1;

            doc.fontSize(13).fillColor('black').text('Transferred to reserve fund (10%)', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(formatForDisplay(ten_percent), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 20;

            const after_appropriation = parseInt(total) - parseInt(ten_percent);

            doc.fontSize(13).fillColor('black').text('Surplus for the year after taxation and appropriation', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(formatForDisplay(after_appropriation), pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 40;

            doc.fontSize(13).fillColor('black').text('Accumulated surplus brought forward', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(accumulated_surplus_brought_forward, pageMargin + 330, currentY, { width: 70, align: 'center' });

            currentY += 40;

            const balance = parseInt(accumulated_surplus_brought_forward) + parseInt(after_appropriation)

            doc.fontSize(13).fillColor('black').text('Accumulated surplus transferred to balance sheet', pageMargin + 30, currentY, { width: 200, align: 'center' });
            doc.text(formatForDisplay(balance), pageMargin + 330, currentY, { width: 70, align: 'center' });

            const incomeStatement = new IncomeStatement({
                startDate: formattedSDate,
                endDate: formattedEDate,
                reservedFund: ten_percent,
                surplusOfTheYear: after_appropriation,
            });

            await incomeStatement.save();
            console.log('Income Statement added successfully');

            doc.end();

        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Failed to generate PDF');
        }
    }
};