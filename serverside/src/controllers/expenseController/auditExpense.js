const Member = require("../../models/memberModels/memberList");
const AuditFeeExpense = require("../../models/expenseModel/auditFeeExpense/auditFeeExpense")
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')

module.exports = {
  createAuditFeeExpense: async (req, res) => {
    const { head_of_account, amount, year, paid_date } = req.body;
    console.log(req.body);
    try {
      if (!paid_date || !year || !head_of_account || !amount) {
        return res.status(400).json({ message: "All fields are required" });
      }
      let main_head_id;
      let sub_head_id;
      if (req.body.head_of_account) {
        ({ main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res));
      }
      const auditFeeExpense = new AuditFeeExpense({
        paidDate: paid_date,
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
        amount: amount,
        year: year,
      });
      await auditFeeExpense.save();
      res.status(201).json({
        message: "Audit Fee Expense created successfully",
        data: auditFeeExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getAuditFeeExpense: async (req, res) => {
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

      const auditFeeExpense = await AuditFeeExpense.find(query)
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .exec();

      if (auditFeeExpense.length === 0) {
        return res.status(404).json({ message: "Audir Fee Expense not found" });
      }

      res.status(200).json(auditFeeExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateAuditFeeExpense: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const auditFeeExpense = await AuditFeeExpense.findById(id).exec();
      if (!auditFeeExpense) {
        return res.status(404).json({ message: "Audit Fee Expense not found" });
      }

      const updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.year) {
        updateData.year = req.body.year;
      }
      if (req.body.head_of_account) {
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(req, res, updateData,auditFeeExpense);
      }
      const updatedAuditFeeExpense = await AuditFeeExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
        message: "Audit Fee  Expense updated successfully",
        data: updatedAuditFeeExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};



