const IncomeHeadOfAccount = require('../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount');
const TypesOfHeadOfAccount = require('../../models/incomeModels/incomeHeadOfAccount/typeOfHeadOfAccount');

module.exports = {
  createHeadOfAccount: async (req, res) => {
    const { head_of_account, income_type } = req.body; 

    try {
      if (!head_of_account) {
        return res.status(400).json({ message: "Head of Account are required" });
      }

      if (typeof head_of_account !== 'string' || head_of_account.trim() === '') {
        return res.status(400).json({ message: "Head of Account must be a non-empty string" });
      }

      const headOfAccountArray = head_of_account.split(',').map((value) => value.trim());
      
      const incomeType = await TypesOfHeadOfAccount.findOne({ type: income_type }).exec();



      const promises = headOfAccountArray.map(async (headOfAccountValue) => {
        const incomeHeadOfAccount = incomeType ? new IncomeHeadOfAccount({
          headOfAccount: headOfAccountValue,
          type: income_type ? incomeType._id : null
        }) : new IncomeHeadOfAccount({
          headOfAccount: headOfAccountValue
        });
        return incomeHeadOfAccount.save();
      });

      const createdIncomeHeadOfAccounts = await Promise.all(promises);

      res.status(201).json({
        message: "Head of Account created successfully",
        data: createdIncomeHeadOfAccounts
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  updateHeadOfAccount: async (req, res) => {
    const { head_of_account, income_type } = req.body;
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }
      const incomeHeadOfAccount = await IncomeHeadOfAccount.findById(id).exec();
      if (!incomeHeadOfAccount) {
        return res.status(404).json({ message: "Head Of Account not found" });
      }
      const updateData = {};
      if (head_of_account) {
        updateData.headOfAccount = head_of_account;
      }
      if (income_type) {
        updateData.incomeType = income_type;
      }
      const updatedIncomeHeadOfAccount = await IncomeHeadOfAccount.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
        message: "Head Of Account updated successfully",
        data: updatedIncomeHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  listOfHeadOfAccount: async (req, res) => {
    try {
      const type = req.query.type;
      const incomeType = await TypesOfHeadOfAccount.findOne({ type: type }).exec();

      let headOfAccount = await IncomeHeadOfAccount.find();
      if (type){
        headOfAccount = await IncomeHeadOfAccount.find({type: incomeType._id}).exec();
      }
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