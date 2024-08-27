const GeneralLedger = require('../../models/ledgerModels/generalLedger');
const Income = require('../../models/incomeModels/income/income');
const LiabilitiesSchema = require('../../models/incomeModels/libility/libility');

module.exports = {
    createIncomeRecord: async (req, res) => {
        try {
            const { startDate, endDate } = req.body;
            const liabilityAccounts = await LiabilitiesSchema.find({}, 'headOfAccount');
            const liabilityAccountIds = liabilityAccounts.map(acc => acc.headOfAccount.toString());
            const ledgerRecords = await GeneralLedger.find({
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                },
                credit: { $exists: true }
            });
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
            const incomeRecord = new Income({
                headOfAccountAmount,
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            });
            await incomeRecord.save();
            res.status(201).json({ message: 'Income record created successfully', data: incomeRecord });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};
