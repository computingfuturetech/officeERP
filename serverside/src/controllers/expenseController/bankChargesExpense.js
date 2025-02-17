const Member = require("../../models/memberModels/memberList");
const BankChargesExpense = require("../../models/expenseModel/bankChargesExpense/bankChargesExpense");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const CheckMainAndSubHeadOfAccount = require("../../services/checkMainAndSubHeadOfAccount");
const BankList = require("../../models/bankModel/bank");
const GeneralLedger = require("../../services/createGeneralLedger");
const BankLedger = require("../../services/createBankLedger");
const VoucherNo = require("../../services/generateVoucherNo");
const CheckBank = require("../../services/checkBank");

module.exports = {
  createBankChargesExpense: async (req, res) => {
    const {
      mainHeadOfAccount,
      subHeadOfAccount,
      amount,
      paidDate,
      particular,
      challanNo,
      chequeNumber,
      bank,
      check = "Bank",
    } = req.body;
    try {
      if (!amount) {
        return res.status(400).json({
          status: "error",
          message: "Amount is required",
        });
      }

      if (!paidDate) {
        return res.status(400).json({
          status: "error",
          message: "Paid Date is required",
        });
      }

      if (check === "Bank" && !bank) {
        return res.status(400).json({
          status: "error",
          message: "Bank is required",
        });
      }
      let bankList;
      if (bank) {
        bankList = await BankList.findById(bank).exec();
        if (!bankList) {
          return res.status(404).json({
            status: "error",
            message: "Bank not found",
          });
        }
      }

      let headOfAccount = subHeadOfAccount
        ? subHeadOfAccount
        : mainHeadOfAccount;

      const bankChargesExpense = new BankChargesExpense({
        paidDate: paidDate,
        mainHeadOfAccount: mainHeadOfAccount,
        subHeadOfAccount: subHeadOfAccount ? subHeadOfAccount : null,
        amount: amount,
        bank: bank ? bank : null,
        particular: particular,
        challanNo: challanNo,
        chequeNumber: chequeNumber,
      });

      const update_id = bankChargesExpense._id;

      const type = "expense";

      const bankVoucherNo = await VoucherNo.generateBankVoucherNo(
        req,
        res,
        bank,
        type
      );
      await BankLedger.createBankLedger(
        req,
        res,
        bankVoucherNo,
        type,
        headOfAccount,
        particular,
        amount,
        paidDate,
        chequeNumber,
        challanNo,
        update_id,
        bank
      );
      await GeneralLedger.createGeneralLedger(
        req,
        res,
        bankVoucherNo,
        type,
        headOfAccount,
        particular,
        amount,
        paidDate,
        chequeNumber,
        challanNo,
        update_id,
        bank
      );

      await bankChargesExpense.save();
      res.status(201).json({
        status: "success",
        message: "Bank Expense created successfully",
        data: bankChargesExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getBankChargesExpense: async (req, res) => {
    const { headOfAccount } = req.query;

    try {
      let query = {};

      if (headOfAccount) {
        const mainHeadOfAccount = await MainHeadOfAccount.findOne({
          headOfAccount: headOfAccount,
        }).exec();

        if (mainHeadOfAccount) {
          query.mainHeadOfAccount = mainHeadOfAccount._id;
        } else {
          return res.status(404).json({
            status: "error",
            message: "Head of Account not found",
          });
        }
      }

      const bankChargesExpense = await BankChargesExpense.find(query)
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate({ path: "bank", select: "bankName accountNo" })
        .exec();

      if (bankChargesExpense.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Bank Expense not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Bank Expense found",
        data: bankChargesExpense,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateBankChargesExpense: async (req, res) => {
    const id = req.query.id;
    const {
      amount,
      paidDate,
      particular,
      challanNo,
      chequeNumber,
      bank,
      check = "Bank",
    } = req.body;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }
      const bankChargesExpense = await BankChargesExpense.findById(id).exec();
      if (!bankChargesExpense) {
        return res.status(404).json({
          status: "error",
          message: "Bank Expense not found",
        });
      }
      const updateData = {};
      if (paidDate) {
        updateData.paidDate = paidDate;
      }
      if (amount) {
        updateData.amount = amount;
      }
      if (particular) {
        updateData.particular = particular;
      }
      if (challanNo) {
        updateData.challanNo = challanNo;
      }
      if (chequeNumber) {
        updateData.chequeNumber = chequeNumber;
      }
      if (bank) {
        bankList = await BankList.findById(bank).exec();
        if (!bankList) {
          return res.status(404).json({
            status: "error",
            message: "Bank not found",
          });
        }
        updateData.bank = bank;
      }

      const type = "expense";

      await BankLedger.updateBankLedger(req, res, id, updateData, type);
      await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);

      const updatedBankChargesExpense =
        await BankChargesExpense.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Bank  Expense updated successfully",
        data: updatedBankChargesExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
