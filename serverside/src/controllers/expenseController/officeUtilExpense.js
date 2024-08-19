const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount");
const OfficeUtilExpense = require("../../models/expenseModel/officeUtilExpense/officeutilExpense");
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');
const VoucherNo = require('../../middleware/generateVoucherNo')
const CashBookLedger = require('../../middleware/createCashBookLedger')


module.exports = {
  createOfficeUtilExpense: async (req, res) => {
    const {
      head_of_account,
      billing_month,
      amount,
      bill_reference,
      adv_tax,
      paid_date,
      check,
      bank_account,
      cheque_no,
      challan_no

    } = req.body;
    console.log(req.body)
    try {
      if (
        !paid_date ||
        !billing_month ||
        !head_of_account ||
        !amount
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
      let main_head_id;
      let sub_head_id;
      if (req.body.head_of_account) {
        ({ main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res));
      }
      const officeUtilExpense = new OfficeUtilExpense({
        paidDate: paid_date,
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
        billingMonth: billing_month,
        amount: amount,
        billReference: bill_reference,
        advTax: adv_tax,
      });

      const update_id = officeUtilExpense._id;

      const type = "expense";

      if(check == "cash")
        {
          const cashVoucherNo = await VoucherNo.generateCashVoucherNo(req, res,type)
          await CashBookLedger.createCashBookLedger(req, res, cashVoucherNo, type, head_of_account,billing_month, amount, paid_date,update_id);
          await GeneralLedger.createGeneralLedger(req, res, cashVoucherNo, type, head_of_account, billing_month, amount, paid_date, null, null,update_id);
        }else if(check == "bank"){
          const bankVoucherNo = await VoucherNo.generateBankVoucherNo(req, res,bank_account,type)
          await BankLedger.createBankLedger(req, res, bankVoucherNo, type, head_of_account,billing_month, amount, paid_date,cheque_no, challan_no,update_id);
          await GeneralLedger.createGeneralLedger(req, res, bankVoucherNo, type, head_of_account, billing_month, amount, paid_date, cheque_no, challan_no,update_id);
        }

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
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(req, res, updateData, OfficeUtilExpense);
      }
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
          .populate("mainHeadOfAccount", "headOfAccount")
          .exec();
      } else {
        officeUtilExpense = await OfficeUtilExpense.find()
          .populate("subHeadOfAccount", "headOfAccount")
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
