const Member = require("../../models/memberModels/memberList");
const BankChargesExpense = require("../../models/expenseModel/bankChargesExpense/bankChargesExpense")
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')
const BankList = require("../../models/bankModel/bank");
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');
const VoucherNo = require('../../middleware/generateVoucherNo')

module.exports = {
  createBankChargesExpense: async (req, res) => {
    const { head_of_account, amount, bank_account,paid_date,particular,challan_no,cheque_no } = req.body;
    console.log(req.body);
    try {
      if (!bank_account || !head_of_account || !amount || !paid_date) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const bank = await BankList.findOne({
        accountNo: bank_account
      });
      if (!bank) {
        return res
          .status(400)
          .json({ message: "Invalid Bank Account Number" });
      }

      let main_head_id;
      let sub_head_id;
      if (req.body.head_of_account) {
        ({ main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res));
      }
      const bankChargesExpense = new BankChargesExpense({
        paidDate: paid_date,
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
        amount: amount,
        bank: bank._id,
        particular: particular,
      });

      const update_id = bankChargesExpense._id;

      const type = "expense";

      const bankVoucherNo = await VoucherNo.generateBankVoucherNo(req, res,bank_account,type)
      await BankLedger.createBankLedger(req, res, bankVoucherNo, type, head_of_account,particular, amount, paid_date,cheque_no, challan_no,update_id);
      // await GeneralLedger.createGeneralLedger(req, res, bankVoucherNo, type, head_of_account, particular, amount, paid_date, cheque_no, challan_no,update_id);

      await bankChargesExpense.save();
      res.status(201).json({
        message: "Bank Expense created successfully",
        data: bankChargesExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getBankChargesExpense: async (req, res) => {
    const { head_of_account } = req.query;

    try {
      let query = {};

      if (head_of_account) {
        const mainHeadOfAccount = await MainHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
  
        if (mainHeadOfAccount) {
          query.mainHeadOfAccount = mainHeadOfAccount._id;
        } else {
          return res.status(404).json({ message: "Head of Account not found" });
        }
      }

      const bankChargesExpense = await BankChargesExpense.find(query)
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate({ path: 'bank', select: 'bankName accountNo' })
        .exec();

      if (bankChargesExpense.length === 0) {
        return res.status(404).json({ message: "Bank Expense not found" });
      }

      res.status(200).json(bankChargesExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateBankChargesExpense: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      console.log(id)

      const bankChargesExpense = await BankChargesExpense.findById(id).exec();
      if (!bankChargesExpense) {
        return res.status(404).json({ message: "Bank Expense not found" });
      }

      const updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.bank_account) {
        const bank = await BankList.findOne({
            accountNo:req.body.bank_account
          });
          if (!bank) {
            return res
              .status(400)
              .json({ message: "Invalid Bank Account Number" });
          }
        updateData.bank = bank._id;
      }
      if (req.body.head_of_account) {
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(req, res, updateData,bankChargesExpense);
      }

      const type = "expense";

      await BankLedger.updateBankLedger(req, res, id, updateData, type);
      // await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);

      const updatedbankChargesExpense = await BankChargesExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
        message: "Bank  Expense updated successfully",
        data: updatedbankChargesExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};



