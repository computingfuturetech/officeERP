const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount");
const OfficeExpense = require("../../models/expenseModel/officeExpense/officeExpense");
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');
const VoucherNo = require('../../middleware/generateVoucherNo')
const CashBookLedger = require('../../middleware/createCashBookLedger')

module.exports = { 
  createOfficeExpense: async (req, res) => {
    const { head_of_account, amount, particulor, vendor, paid_date,check,bank_account,cheque_no,challan_no } = req.body;
    console.log(req.body);
    try {
      if (!paid_date || !particulor || !vendor || !head_of_account || !amount) {
        return res.status(400).json({ message: "All fields are required" });
      }
      let main_head_id;
      let sub_head_id;
      if (req.body.head_of_account) {
        ({ main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res));
      }
      const officeExpense = new OfficeExpense({
        paidDate: paid_date,
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
        amount: amount,
        particulor: particulor,
        vendor: vendor,
      });

      const update_id = officeExpense._id;

      const type = "expense";

      if(check == "cash")
        {
          const cashVoucherNo = await VoucherNo.generateCashVoucherNo(req, res,type)
          await CashBookLedger.createCashBookLedger(req, res, cashVoucherNo, type, head_of_account,particulor, amount, paid_date,update_id);
          await GeneralLedger.createGeneralLedger(req, res, cashVoucherNo, type, head_of_account, particulor, amount, paid_date, null, null,update_id);
        }else if(check == "bank"){
          const bankVoucherNo = await VoucherNo.generateBankVoucherNo(req, res,bank_account,type)
          await BankLedger.createBankLedger(req, res, bankVoucherNo, type, head_of_account,particulor, amount, paid_date,cheque_no, challan_no,update_id);
          await GeneralLedger.createGeneralLedger(req, res, bankVoucherNo, type, head_of_account, particulor, amount, paid_date, cheque_no, challan_no,update_id);
        }

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
      if (req.body.challan_no) {
        updateData.challanNo = req.body.challan_no;
      }
      if (req.body.cheque_no) {
        updateData.chequeNo = req.body.cheque_no;
      }
      if (req.body.head_of_account) {
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(req, res, updateData, officeExpense);
      }

      const type = "expense";

      if (req.body.check == "cash") {
        await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      }
      else if (req.body.check == "bank") {
        await BankLedger.updateBankLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      }
      else {
        console.log("Invalid Check")
      }

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

      const officeExpenses = await OfficeExpense.find(query)
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
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
