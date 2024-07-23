const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount");
const LegalProfessionalExpense = require("../../models/expenseModel/legalProfessionalExpense/legalProfessionalExpense")

module.exports = {
  createLegalProfessionalExpense: async (req, res) => {
    const { head_of_account, amount, particulor, billing_month, paid_date } = req.body;
    console.log(req.body);
    try {
      if (!paid_date || !particulor || !billing_month || !head_of_account || !amount) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const headOfAccount = await HeadOfAccount.findOne({
        headOfAccount: head_of_account,
      });
      if (!headOfAccount) {
        return res.status(404).json({ message: "Head of Account not found" });
      }
      const legalProfessionalExpense = new LegalProfessionalExpense({
        paidDate: paid_date,
        headOfAccount: headOfAccount._id,
        amount: amount,
        particulor: particulor,
        billingMonth: billing_month,
      });
      await legalProfessionalExpense.save();
      res.status(201).json({
        message: "Legal Professional Expense created successfully",
        data: legalProfessionalExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getLegalProfessionalExpense: async (req, res) => {
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

      const legalProfessionalExpense = await LegalProfessionalExpense.find(query)
        .populate("headOfAccount", "headOfAccount")
        .exec();

      if (legalProfessionalExpense.length === 0) {
        return res.status(404).json({ message: "Legal Professional Expense not found" });
      }

      res.status(200).json(legalProfessionalExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateLegalProfessionalExpense: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const legalProfessionalExpense = await LegalProfessionalExpense.findById(id).exec();
      if (!legalProfessionalExpense) {
        return res.status(404).json({ message: "Legal Professional Expense not found" });
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
      if (req.body.billing_month) {
        updateData.billingMonth = req.body.billing_month;
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

      const updatedlegalProfessionalExpense = await LegalProfessionalExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
        message: "Legal Professiona  Expense updated successfully",
        data: updatedlegalProfessionalExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
