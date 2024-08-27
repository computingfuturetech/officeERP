const AuditFeeExpense = require("../../models/expenseModel/auditFeeExpense/auditFeeExpense")
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const BankChargesExpense = require("../../models/expenseModel/bankChargesExpense/bankChargesExpense")
const ElectricityAndWaterConnectionExpense = require("../../models/expenseModel/electricityAndWaterConnectionExpense/electricityAndWaterConnectionExpense")
const LegalProfessionalExpense = require("../../models/expenseModel/legalProfessionalExpense/legalProfessionalExpense")
const MiscellaneousExpense = require("../../models/expenseModel/miscellaneousExpense/miscellaneousExpense")
const OfficeExpense = require("../../models/expenseModel/officeExpense/officeExpense");
const OfficeUtilExpense = require("../../models/expenseModel/officeUtilExpense/officeutilExpense");
const Salaries = require("../../models/expenseModel/salaries/salaries");
const VechicleDisposal = require("../../models/expenseModel/vehicleDisposalExpense/vehicleDisposalExpense");


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
                AuditFeeExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").sort({ createdAt: -1 }) .exec(),
                BankChargesExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").sort({ createdAt: -1 }) .exec(),
                ElectricityAndWaterConnectionExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").sort({ createdAt: -1 }) .exec(),
                LegalProfessionalExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").sort({ createdAt: -1 }) .exec(),
                MiscellaneousExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").sort({ createdAt: -1 }) .exec(),
                OfficeExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").sort({ createdAt: -1 }) .exec(),
                OfficeUtilExpense.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").sort({ createdAt: -1 }) .exec(),
                Salaries.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").sort({ createdAt: -1 }) .exec(),
                VechicleDisposal.find(query, 'headOfAccount amount paidDate').populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").sort({ createdAt: -1 }) .exec(),
            ]);
    
            const allExpenses = expenses.flat();
            
    
            if (allExpenses.length === 0) {
                return res.status(404).json({ message: "No expenses found for the given expense type" });
            }
    
            res.status(200).json(allExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    getExpenseByHeadOfAccount: async (req, res) => {
        const { headOfAccountId, mainId } = req.query;
      
        if (!headOfAccountId || !mainId) {
          return res.status(400).json({ message: "Head of Account ID and Main ID are required" });
        }
      
        try {
          const query = {
            $or: [
              { mainHeadOfAccount: headOfAccountId, _id: mainId },
              { subHeadOfAccount: headOfAccountId, _id: mainId }
            ]
          };
      
          const expenses = await Promise.all([
            AuditFeeExpense.findOne(query).populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").populate("bank","bankName accountNo").exec(),
            BankChargesExpense.findOne(query).populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").populate("bank","bankName accountNo").exec(),
            ElectricityAndWaterConnectionExpense.findOne(query).populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").exec(),
            LegalProfessionalExpense.findOne(query).populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").populate("bank","bankName accountNo").exec(),
            MiscellaneousExpense.findOne(query).populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").populate("bank","bankName accountNo").exec(),
            OfficeExpense.findOne(query).populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").populate("bank","bankName accountNo").exec(),
            OfficeUtilExpense.findOne(query).populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").populate("bank","bankName accountNo").exec(),
            Salaries.findOne(query).populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").populate("bank","bankName accountNo").exec(),
            VechicleDisposal.findOne(query).populate("mainHeadOfAccount", "headOfAccount").populate("subHeadOfAccount", "headOfAccount").exec(),
          ]);
      
          const expense = expenses.find(expense => expense !== null);
      
          if (!expense) {
            return res.status(404).json({ message: "No expense found for the given head of account ID and main ID" });
          }
      
          res.status(200).json(expense);
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      },
};