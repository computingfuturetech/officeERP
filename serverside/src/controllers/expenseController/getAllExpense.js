const AuditFeeExpense = require("../../models/expenseModel/auditFeeExpense/auditFeeExpense")
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const BankChargesExpense = require("../../models/expenseModel/bankChargesExpense/bankChargesExpense")
const ElectricityAndWaterConnectionExpense = require("../../models/expenseModel/electricityAndWaterConnectionExpense/electricityAndWaterConnectionExpense")
const LegalProfessionalExpense = require("../../models/expenseModel/legalProfessionalExpense/legalProfessionalExpense")
const MiscellaneousExpense = require("../../models/expenseModel/miscellaneousExpense/miscellaneousExpense")
const OfficeExpense = require("../../models/expenseModel/officeExpense/officeExpense");
const OfficeUtilExpense = require("../../models/expenseModel/officeUtilExpense/officeutilExpense");

module.exports = {
    getAllExpense: async (req, res) => {
        const { expense_type } = req.query;
    
        try {
            
            if (!expense_type) {
                return res.status(400).json({ message: "Expense type is required" });
            }
    
            const mainHeadAccounts = await MainHeadOfAccount.find({ expenseType: expense_type }).exec();
    
            if (mainHeadAccounts.length === 0) {
                return res.status(404).json({ message: "No Main Head of Account found for the given expense type" });
            }
    
            const mainHeadAccountIds = mainHeadAccounts.map(account => account._id);
    
            const subHeadAccounts = await SubExpenseHeadOfAccount.find({ mainHeadOfAccount: { $in: mainHeadAccountIds } }).exec();
            const subHeadAccountIds = subHeadAccounts.map(account => account._id);

            const query = {
                $or: [
                    { mainHeadOfAccount: { $in: mainHeadAccountIds } },
                    { subHeadOfAccount: { $in: subHeadAccountIds } }
                ]
            };
    
            const expenses = await Promise.all([
                AuditFeeExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").exec(),
                BankChargesExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").exec(),
                ElectricityAndWaterConnectionExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").exec(),
                LegalProfessionalExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").exec(),
                MiscellaneousExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").exec(),
                OfficeExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").exec(),
                OfficeUtilExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").exec()
            ]);
    
            const allExpenses = expenses.flat();
    
            if (allExpenses.length === 0) {
                return res.status(404).json({ message: "No expenses found for the given expense type" });
            }
    
            res.status(200).json(allExpenses);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};