const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');

module.exports = {
  listOfHeadOfAccount: async (req, res) => {
    try {
      const expenseType = req.query.expense_type;
      let filter = {};

      if (expenseType) {
        filter = { expenseType: expenseType };
      }
      const headOfAccount = await MainHeadOfAccount.find(filter).populate('subExpenseHeads');
      if (headOfAccount.length === 0) {
        res.status(404).json({ message: "No head of accounts found" });
      } else {
        res.status(200).json(headOfAccount);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}