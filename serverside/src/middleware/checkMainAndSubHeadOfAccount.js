const SubExpenseHeadOfAccount = require('../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');


module.exports = {
    getHeadOfAccount: async (req, res, updateData, legalProfessionalExpense) => {
        if (req.body.head_of_account) {
          const mainHeadOfAccount = await MainHeadOfAccount.findOne({
            headOfAccount: req.body.head_of_account,
          });
          const subHeadOfAccount = await SubExpenseHeadOfAccount.findOne({
            headOfAccount: req.body.head_of_account,
          });
          if (!mainHeadOfAccount && !subHeadOfAccount) {
            return res.status(404).json({ message: "Head of Account not found" });
          }
          if (mainHeadOfAccount) {
            updateData.mainHeadOfAccount = mainHeadOfAccount._id;
            if (legalProfessionalExpense.subHeadOfAccount) {
              delete legalProfessionalExpense.subHeadOfAccount
              await legalProfessionalExpense.save()
            }
          } 
          else if (subHeadOfAccount) {
            updateData.subHeadOfAccount = subHeadOfAccount._id;
            if (legalProfessionalExpense.mainHeadOfAccount) {
              delete legalProfessionalExpense.mainHeadOfAccount
              await legalProfessionalExpense.save()
            }
          }
        }
      },
      createHeadOfAccount: async (req, res) => {
        const mainHeadOfAccount = await MainHeadOfAccount.findOne({
          headOfAccount: req.body.head_of_account,
        });
        const subHeadOfAccount = await SubExpenseHeadOfAccount.findOne({
          headOfAccount: req.body.head_of_account,
        });
        if (!mainHeadOfAccount &&!subHeadOfAccount) {
          return res.status(404).json({ message: "Head of Account not found" });
        }
        let main_head_id;
        let sub_head_id;
        if (mainHeadOfAccount) {
          main_head_id = mainHeadOfAccount._id;
        } else {
          sub_head_id = subHeadOfAccount._id;
        }
        return { main_head_id, sub_head_id };
      },
};