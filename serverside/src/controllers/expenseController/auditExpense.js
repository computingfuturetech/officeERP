const Member = require("../../models/memberModels/memberList");
const AuditFeeExpense = require("../../models/expenseModel/auditFeeExpense/auditFeeExpense")
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')
const VoucherNo = require('../../middleware/generateVoucherNo')
const CashBookLedger = require('../../middleware/createCashBookLedger')
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');

module.exports = {
  createAuditFeeExpense: async (req, res) => {
    const { head_of_account, amount, year, paid_date, check,particular,cheque_no,challan_no,bank_account } = req.body;
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
        particular: particular,
        chequeNo: cheque_no,
        challanNo: challan_no,
        accountNo: bank_account
      });

      const update_id = auditFeeExpense._id;

      const type = "expense";

      if(check == "cash")
      {
        const cashVoucherNo = await VoucherNo.generateCashVoucherNo(req, res,type)
        await CashBookLedger.createCashBookLedger(req, res, cashVoucherNo, type, head_of_account,particular, amount, paid_date,update_id);
        await GeneralLedger.createGeneralLedger(req, res, cashVoucherNo, type, head_of_account, particular, amount, paid_date, null, null,update_id);
      }else if(check == "bank"){
        const bankVoucherNo = await VoucherNo.generateBankVoucherNo(req, res,bank_account,type)
        await BankLedger.createBankLedger(req, res, bankVoucherNo, type, head_of_account,particular, amount, paid_date,cheque_no, challan_no,update_id);
        await GeneralLedger.createGeneralLedger(req, res, bankVoucherNo, type, head_of_account, particular, amount, paid_date, cheque_no, challan_no,update_id);
      }

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
      if(req.body.particular){
        updateData.particular = req.body.particular;
      }
      if(req.body.challan_no){
        updateData.challanNo = req.body.challan_no;
      }
      if(req.body.cheque_no){
        updateData.chequeNo = req.body.cheque_no;
      }
      if (req.body.head_of_account) {
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(req, res, updateData,auditFeeExpense);
      }
      const updatedAuditFeeExpense = await AuditFeeExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      const type = "expense";

      if(req.body.check=="cash")
      {
        await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      }
      else if(req.body.check=="bank")
      {
        await BankLedger.updateBankLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      }
      else{
        console.log("Invalid Check")
      }

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



