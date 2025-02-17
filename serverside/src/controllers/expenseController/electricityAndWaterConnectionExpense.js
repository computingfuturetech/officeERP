const ElectricityAndWaterConnectionExpense = require("../../models/expenseModel/electricityAndWaterConnectionExpense/electricityAndWaterConnectionExpense");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const CheckMainAndSubHeadOfAccount = require("../../services/checkMainAndSubHeadOfAccount");
const GeneralLedger = require("../../services/createGeneralLedger");
const BankLedger = require("../../services/createBankLedger");
const VoucherNo = require("../../services/generateVoucherNo");
const CashBookLedger = require("../../services/createCashBookLedger");
const CheckBank = require("../../services/checkBank");
const BankList = require("../../models/bankModel/bank");

module.exports = {
  createElectricityAndWaterConnectionExpense: async (req, res) => {
    const {
      mainHeadOfAccount,
      subHeadOfAccount,
      amount,
      vendor,
      description,
      paidDate,
      chequeNumber,
      challanNo,
      check,
      bank,
    } = req.body;

    try {
      if (!paidDate) {
        return res.status(400).json({
          status: "error",
          message: "Paid Date is required",
        });
      }

      if (!amount) {
        return res.status(400).json({
          status: "error",
          message: "Amount is required",
        });
      }

      let headOfAccount = subHeadOfAccount
        ? subHeadOfAccount
        : mainHeadOfAccount;

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

      const electricityAndWaterConnectionExpense =
        new ElectricityAndWaterConnectionExpense({
          paidDate: paidDate,
          mainHeadOfAccount: mainHeadOfAccount,
          subHeadOfAccount: subHeadOfAccount,
          amount: amount,
          vendor: vendor,
          description: description,
          bank: bank ? bank : null,
          ...(check === "Bank"
            ? { chequeNumber: chequeNumber }
            : { chequeNumber: undefined }),
          check: check,
          challanNo: challanNo,
        });

      const update_id = electricityAndWaterConnectionExpense._id;

      const type = "expense";

      if (check == "Cash") {
        const cashVoucherNo = await VoucherNo.generateCashVoucherNo(
          req,
          res,
          type
        );
        await CashBookLedger.createCashBookLedger(
          req,
          res,
          cashVoucherNo,
          type,
          headOfAccount,
          description,
          amount,
          paidDate,
          update_id
        );
        await GeneralLedger.createGeneralLedger(
          req,
          res,
          cashVoucherNo,
          type,
          headOfAccount,
          description,
          amount,
          paidDate,
          null,
          challanNo,
          update_id,
          bank
        );
      } else if (check == "Bank") {
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
          description,
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
          description,
          amount,
          paidDate,
          chequeNumber,
          challanNo,
          update_id,
          bank
        );
      }

      await electricityAndWaterConnectionExpense.save();
      res.status(201).json({
        status: "success",
        message:
          "Electricity and Water connection Expense created successfully",
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
        const mainHeadOfAccount = await MainHeadOfAccount.findOne({
          headOfAccount: head_of_account,
        }).exec();
        const subHeadOfAccount = await SubExpenseHeadOfAccount.findOne({
          headOfAccount: head_of_account,
        }).exec();

        if (mainHeadOfAccount) {
          query.mainHeadOfAccount = mainHeadOfAccount._id;
        } else if (subHeadOfAccount) {
          query.subHeadOfAccount = subHeadOfAccount._id;
        } else {
          return res.status(404).json({ message: "Head of Account not found" });
        }
      }

      const electricityAndWaterConnectionExpense =
        await ElectricityAndWaterConnectionExpense.find(query)
          .populate("mainHeadOfAccount", "headOfAccount")
          .populate("subHeadOfAccount", "headOfAccount")
          .exec();

      if (electricityAndWaterConnectionExpense.length === 0) {
        return res
          .status(404)
          .json({ message: "Electricity and Water Expense not found" });
      }

      res.status(200).json(electricityAndWaterConnectionExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateElectricityAndWaterConnectionExpense: async (req, res) => {
    const { id } = req.query;
    const {
      amount,
      vendor,
      description,
      paidDate,
      chequeNumber,
      challanNo,
      check,
      bank,
    } = req.body;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }

      const electricityAndWaterConnectionExpense =
        await ElectricityAndWaterConnectionExpense.findById(id).exec();
      if (!electricityAndWaterConnectionExpense) {
        return res.status(404).json({
          status: "error",
          message: "Electricity and Water connection Expense not found",
        });
      }

      const updateData = {};
      if (paidDate) {
        updateData.paidDate = paidDate;
      }
      if (amount) {
        updateData.amount = amount;
      }
      if (vendor) {
        updateData.vendor = vendor;
      }
      if (description) {
        updateData.description = description;
      }
      if (challanNo) {
        updateData.challanNo = challanNo;
      }
      if (chequeNumber) {
        updateData.chequeNo = chequeNumber;
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

      if (req.body.check == "Cash") {
        await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      } else if (req.body.check == "Bank") {
        await BankLedger.updateBankLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      } else {
        console.log("Invalid Check");
      }

      const updatedelectricityAndWaterConnectionExpense =
        await ElectricityAndWaterConnectionExpense.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message:
          "Electricity and Water connection Expense updated successfully",
        data: updatedelectricityAndWaterConnectionExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
