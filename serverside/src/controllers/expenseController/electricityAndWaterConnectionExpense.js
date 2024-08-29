const ElectricityAndWaterConnectionExpense = require("../../models/expenseModel/electricityAndWaterConnectionExpense/electricityAndWaterConnectionExpense")
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');
const VoucherNo = require('../../middleware/generateVoucherNo')
const CashBookLedger = require('../../middleware/createCashBookLedger')
const CheckBank = require('../../middleware/checkBank');

module.exports = {
  createElectricityAndWaterConnectionExpense: async (req, res) => {
    const { head_of_account, amount, vendor, description, paid_date, cheque_no, challan_no, check, bank_account } = req.body;
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

      const { bank_id } = await CheckBank.checkBank(req, res, bank_account);

      const electricityAndWaterConnectionExpense = new ElectricityAndWaterConnectionExpense({
        paidDate: paid_date,
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
        amount: amount,
        vendor: vendor,
        description: description,
        bank: bank_id?bank_id:null,
        ...(check === 'Bank' ? { chequeNumber: cheque_no } : { chequeNumber: undefined}),
        check: check,
        challanNo: challan_no
      });

      const update_id = electricityAndWaterConnectionExpense._id;

      const type = "expense";

      if (check == "Cash") {
        const cashVoucherNo = await VoucherNo.generateCashVoucherNo(req, res, type)
        await CashBookLedger.createCashBookLedger(req, res, cashVoucherNo, type, head_of_account, description, amount, paid_date, update_id);
        await GeneralLedger.createGeneralLedger(req, res, cashVoucherNo, type, head_of_account, description, amount, paid_date, null, challan_no, update_id,bank_account);
      } else if (check == "Bank") {
        const bankVoucherNo = await VoucherNo.generateBankVoucherNo(req, res, bank_account, type)
        await BankLedger.createBankLedger(req, res, bankVoucherNo, type, head_of_account, description, amount, paid_date, cheque_no, challan_no, update_id,bank_account);
        await GeneralLedger.createGeneralLedger(req, res, bankVoucherNo, type, head_of_account, description, amount, paid_date, cheque_no, challan_no, update_id,bank_account);
      }

      await electricityAndWaterConnectionExpense.save();
      res.status(201).json({
        message: "Electricity and Water connection Expense created successfully",
        data: electricityAndWaterConnectionExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getElectricityAndWaterConnectionExpense: async (req, res) => {
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

      const electricityAndWaterConnectionExpense = await ElectricityAndWaterConnectionExpense.find(query)
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .exec();

      if (electricityAndWaterConnectionExpense.length === 0) {
        return res.status(404).json({ message: "Electricity and Water Expense not found" });
      }

      res.status(200).json(electricityAndWaterConnectionExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateElectricityAndWaterConnectionExpense: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const electricityAndWaterConnectionExpense = await ElectricityAndWaterConnectionExpense.findById(id).exec();
      if (!electricityAndWaterConnectionExpense) {
        return res.status(404).json({ message: "Electricity and Water connection Expense not found" });
      }

      const updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.vendor) {
        updateData.vendor = req.body.vendor;
      }
      if (req.body.description) {
        updateData.description = req.body.description;
      }
      if (req.body.challan_no) {
        updateData.challanNo = req.body.challan_no;
      }
      if (req.body.cheque_no) {
        updateData.chequeNo = req.body.cheque_no;
      }
      if (req.body.head_of_account) {
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(req, res, updateData, electricityAndWaterConnectionExpense);
      }

      const type = "expense";

      if (req.body.check == "Cash") {
        await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      }
      else if (req.body.check == "Bank") {
        await BankLedger.updateBankLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      }
      else {
        console.log("Invalid Check")
      }

      const updatedelectricityAndWaterConnectionExpense = await ElectricityAndWaterConnectionExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
        message: "Electricity and Water connection Expense updated successfully",
        data: updatedelectricityAndWaterConnectionExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};



