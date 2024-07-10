const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount");
const OfficeUtilExpense = require("../../models/expenseModel/officeUtilExpense/officeutilExpense");

module.exports = {
  createOfficeUtilExpense: async (req, res) => {
    const {
      head_of_account,
      billing_month,
      amount,
      bill_reference,
      adv_tax,
      paid_date,
    } = req.body;
    console.log(req.body)
    try {
      if (
        !paid_date ||
        !billing_month ||
        !bill_reference ||
        !head_of_account ||
        !adv_tax ||
        !amount
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const headOfAccount = await HeadOfAccount.findOne({
        headOfAccount: head_of_account,
      });
      if (!headOfAccount) {
        return res.status(404).json({ message: "Head of Account not found" });
      }
      const officeUtilExpense = new OfficeUtilExpense({
        paidDate: paid_date,
        headOfAccount: headOfAccount._id,
        billingMonth: billing_month,
        amount: amount,
        billReference: bill_reference,
        advTax: adv_tax,
      });
      await officeUtilExpense.save();
      res.status(201).json({
        message: "OfficeUtil Expense created successfully",
        data: officeUtilExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
    updateOfficeUtilExpense: async (req, res) => {
      const id = req.query.id;
      try {
        if (!id) {
          return res.status(400).json({ message: "ID is required" });
        }
        const officeUtilExpense = await OfficeUtilExpense.findById(id).exec();
        if (!officeUtilExpense) {
          return res.status(404).json({ message: "Office Util Expense not found" });
        }
        const updateData = {};
        if (req.body.paid_date) {
          updateData.paidDate = req.body.paid_date;
        }
        if (req.body.billing_month) {
          updateData.billingMonth = req.body.billing_month;
        }
        if (req.body.amount) {
          updateData.amount = req.body.amount;
        }
        if (req.body.adv_tax) {
            updateData.advTax = req.body.adv_tax;
          }
        if (req.body.bill_reference) {
          updateData.billReference = req.body.bill_reference;
        }
        if (req.body.head_of_account) {
          const headOfAccount = await HeadOfAccount.findOne({ headOfAccount: req.body.head_of_account });
          if (!headOfAccount) {
            return res.status(404).json({ message: "Head of Account not found" });
          }
          updateData.headOfAccount = headOfAccount._id;
        }
        console.log("Update Data:", updateData);
        const updatedOfficeUtilExpense = await OfficeUtilExpense.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();
        res.status(200).json({
          message: "Office Utility  Expense updated successfully",
          data: updatedOfficeUtilExpense,
        });
      } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  getOfficeUtilExpense: async (req, res) => {
    const { billing_month } = req.query;
    try {
      let officeUtilExpense;

      if (billing_month) {
        officeUtilExpense = await OfficeUtilExpense.find({
          billingMonth: billing_month,
        })
          .populate("headOfAccount", "headOfAccount")
          .exec();
      } else {
        officeUtilExpense = await OfficeUtilExpense.find()
          .populate("headOfAccount", "headOfAccount")
          .exec();
      }

      if (officeUtilExpense.length === 0) {
        return res
          .status(404)
          .json({ message: "Office Util Expense not found" });
      }

      res.status(200).json(officeUtilExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
