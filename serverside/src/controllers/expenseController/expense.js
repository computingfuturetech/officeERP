const GeneralLedger = require('../../models/ledgerModels/generalLedger');
const Expense = require('../../models/expenseModel/expense/expense');
const LiabilitiesSchema = require('../../models/incomeModels/libility/libility');

module.exports = {
    createExpenseRecord: async (req, res) => {
        try {
            const { startDate, endDate } = req.body;
            const liabilityAccounts = await LiabilitiesSchema.find({}, 'headOfAccount');
            const liabilityAccountIds = liabilityAccounts.map(acc => acc.headOfAccount.toString());
            const ledgerRecords = await GeneralLedger.find({
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                },
                debit: { $exists: true }
            });

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

            const expenseRecord = new Expense({
                headOfAccountAmount: [...mainHeadOfAccountAmount, ...subHeadOfAccountAmount],
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            });
            await expenseRecord.save();
            res.status(201).json({ message: 'expense record created successfully', data: expenseRecord });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};
