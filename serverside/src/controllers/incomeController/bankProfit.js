const BankList = require("../../models/bankModel/bank");
const BankProfit = require("../../models/incomeModels/bankProfitModels/bankProfit");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const bankLedger = require("../../models/ledgerModels/bankLedger")
const fixedAmount = require("../../models/fixedAmountModel/fixedAmount")
const mongoose = require('mongoose')
const VoucherNo = require('../../middleware/generateVoucherNo')
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');

module.exports = {
  createBankProfit: async (req, res) => {
    const { amount, bank_account, profit_month, paid_date, challan_no, cheque_no } = req.body;
    try {
      if (!amount || !bank_account || !profit_month) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const head_of_account = "Bank Profit";
      const incomeHeadOfAccount = await IncomeHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
      if (!incomeHeadOfAccount) {
        return res.status(404).json({ message: 'Income head of account not found' });
      }
      const bankList = await BankList.findOne({
        accountNo: bank_account
      });
      if (!bankList) {
        return res
          .status(400)
          .json({ message: "Invalid Bank Account Number" });
      }
      const bankProfit = new BankProfit({
        amount: amount,
        bank: bankList._id,
        profitMonth: profit_month,
        paidDate: paid_date,
        headOfAccount: incomeHeadOfAccount._id,
        chequeNo: cheque_no,
        challanNo: challan_no
      });
      const update_id = bankProfit._id;
      const type = "income";
      const bankVoucherNo = await VoucherNo.generateBankVoucherNo(req, res, bank_account, type)
      await BankLedger.createBankLedger(req, res, bankVoucherNo, type, head_of_account, profit_month, amount, paid_date, cheque_no, challan_no, update_id,bank_account);
      await GeneralLedger.createGeneralLedger(req, res, bankVoucherNo, type, head_of_account, profit_month, amount, paid_date, cheque_no, challan_no, update_id,bank_account);
      await bankProfit.save();
      res.status(200).json({
        message: "Bank profit created successfully",
        data: bankProfit,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateBankProfit: async (req, res) => {
    const id = req.query.id;
    const { amount, bank_account, profit_month, paid_date } = req.body;
    try {
      const bankProfit = await BankProfit.findById(id).exec();
      if (!bankProfit) {
        return res.status(404).json({ message: "Bank Profit not found" });
      }
      const head_of_account = "Bank Profit";
      const updateData = {};
      if (head_of_account) {
        const incomeHeadOfAccount = await IncomeHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
        if (!incomeHeadOfAccount) {
          return res.status(404).json({ message: 'Income head of account not found' });
        }
        updateData.headOfAccount = incomeHeadOfAccount._id;
      }
      if (bank_account) {
        const bankList = await BankList.findOne({ accountNo: bank_account });
        if (!bankList) {
          return res.status(400).json({ message: "Invalid bank_name or bank_account" });
        }
        updateData.bank = bankList._id;
      }
      if (amount) {
        updateData.amount = amount;
      }
      if (paid_date) {
        updateData.paidDate = paid_date;
      }
      if (profit_month) {
        updateData.profitMonth = profit_month;
      }
      const type = "income";
      await BankLedger.updateBankLedger(req, res, id, updateData, type);
      await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      const updatedBankProfit = await BankProfit.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();
      res.status(200).json({
        message: "Bank Profit updated successfully",
        data: updatedBankProfit,
      });
    } catch (err) {
      winston.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  getBankProfits: async (req, res) => {
    const { id, bank_account, sort, profit_month, page_no = 1, limit = 10 } = req.query;
    let sortOrder = {};
    if (sort === 'asc') {
      sortOrder = { amount: 1 };
    } else if (sort === 'desc') {
      sortOrder = { amount: -1 };
    }
    try {
      let filter = {};

      if (profit_month) {
        filter.profitMonth = profit_month;
      }
      if (id) {
        const bankProfit = await BankProfit.findById(id)
          .populate('bank', 'bankName accountNo')
          .populate('headOfAccount', 'headOfAccount')
          .exec();
        if (!bankProfit) {
          return res.status(404).json({ message: "Bank Profit not found" });
        }
        res.status(200).json(bankProfit);
      } else {
        let bankProfits = await BankProfit.find(filter)
          .populate('bank', 'bankName accountNo')
          .populate('headOfAccount', 'headOfAccount')
          .exec();

        if (bank_account) {
          bankProfits = bankProfits.filter((bankProfit) => bankProfit.bank.accountNo === bank_account);
        }
        const totalCount = bankProfits.length;
        bankProfits = bankProfits.slice((page_no - 1) * limit, page_no * limit);
        let hasMore = totalCount > page_no * limit;
        res.status(200).json({ bankProfits, hasMore });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
