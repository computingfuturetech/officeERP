const MiscellaneousExpense = require("../../models/expenseModel/miscellaneousExpense/miscellaneousExpense")
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')

module.exports = {
  createMiscellaneousExpense: async (req, res) => {
    const { head_of_account, amount, description, vendor_name,plot_number, paid_date } = req.body;
    console.log(req.body);
    try {
      if (!paid_date || !head_of_account || !amount) {
        return res.status(400).json({ message: "All fields are required" });
      }
      let main_head_id;
      let sub_head_id;
      if (req.body.head_of_account) {
        ({ main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res));
      }
      const miscellaneousExpense = new MiscellaneousExpense({
        paidDate: paid_date,
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
        amount: amount,
        vendor: vendor_name,
        plotNumber: plot_number,
        description: description
      });
      await miscellaneousExpense.save();
      res.status(201).json({
        message: "Miscellaneous Expense created successfully",
        data: miscellaneousExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getMiscellaneousExpense: async (req, res) => {
    const { head_of_account } = req.query;

    try {
      let query = {};

      if (head_of_account) {
        const mainHeadOfAccount = await MainHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
        const subHeadOfAccount = await SubExpenseHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
  
        if (mainHeadOfAccount) {
          query.mainHeadOfAccount = mainHeadOfAccount._id;
        } else if (subHeadOfAccount) {
          query.subHeadOfAccount = subHeadOfAccount._id;
        } else {
          return res.status(404).json({ message: "Head of Account not found" });
        }
      }

      const miscellaneousExpense = await MiscellaneousExpense.find(query)
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .exec();

      if (miscellaneousExpense.length === 0) {
        return res.status(404).json({ message: "Miscellaneous Expense not found" });
      }

      res.status(200).json(miscellaneousExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateMiscellaneousExpense: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const miscellaneousExpense = await MiscellaneousExpense.findById(id).exec();
      if (!miscellaneousExpense) {
        return res.status(404).json({ message: "Miscellaneous Expense not found" });
      }

      const updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.vendor_name) {
        updateData.vendor = req.body.vendor_name;
      }
      if (req.body.plot_number) {
        updateData.plot_number = req.body.plot_number;
      }
      if (req.body.head_of_account) {
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(req, res, updateData,miscellaneousExpense);
      }
      const updatedmiscellaneousExpense = await MiscellaneousExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
        message: "Miscellaneous Expense updated successfully",
        data: updatedmiscellaneousExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};



