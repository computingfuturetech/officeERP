const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount");
const OfficeExpense = require("../../models/expenseModel/officeExpense/officeExpense");

module.exports = {
  createOfficeExpense: async (req, res) => {
    const { head_of_account, amount, particulor, vendor, paid_date } = req.body;
    console.log(req.body);
    try {
      if (!paid_date || !particulor || !vendor || !head_of_account || !amount) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const headOfAccount = await HeadOfAccount.findOne({
        headOfAccount: head_of_account,
      });
      if (!headOfAccount) {
        return res.status(404).json({ message: "Head of Account not found" });
      }
      const officeExpense = new OfficeExpense({
        paidDate: paid_date,
        headOfAccount: headOfAccount._id,
        amount: amount,
        particulor: particulor,
        vendor: vendor,
      });
      await officeExpense.save();
      res.status(201).json({
        message: "Office Expense created successfully",
        data: officeExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateOfficeExpense: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const officeExpense = await OfficeExpense.findById(id).exec();
      if (!officeExpense) {
        return res.status(404).json({ message: "Office Expense not found" });
      }

      const updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.particulor) {
        updateData.particulor = req.body.particulor;
      }
      if (req.body.vendor) {
        updateData.vendor = req.body.vendor;
      }
      if (req.body.head_of_account) {
        const headOfAccount = await HeadOfAccount.findOne({
          headOfAccount: req.body.head_of_account,
        });
        if (!headOfAccount) {
          return res.status(404).json({ message: "Head of Account not found" });
        }
        updateData.headOfAccount = headOfAccount._id;
      }

      console.log("Update Data:", updateData);

      const updatedOfficeExpense = await OfficeExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
        message: "Office Expense updated successfully",
        data: updatedOfficeExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getOfficeExpense: async (req, res) => {
    const { head_of_account } = req.query;

    try {
      let query = {};

      if (head_of_account) {
        const headOfAccount = await HeadOfAccount.findOne({
          headOfAccount: head_of_account,
        }).exec();
        if (!headOfAccount) {
          return res.status(404).json({ message: "Head of Account not found" });
        }
        query.headOfAccount = headOfAccount._id;
      }

      const officeExpenses = await OfficeExpense.find(query)
        .populate("headOfAccount", "headOfAccount")
        .exec();

      if (officeExpenses.length === 0) {
        return res.status(404).json({ message: "Office Expense not found" });
      }

      res.status(200).json(officeExpenses);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
