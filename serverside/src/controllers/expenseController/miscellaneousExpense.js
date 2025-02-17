const MiscellaneousExpense = require("../../models/expenseModel/miscellaneousExpense/miscellaneousExpense");
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
  createMiscellaneousExpense: async (req, res) => {
    const {
      mainHeadOfAccount,
      subHeadOfAccount,
      amount,
      description,
      vendor,
      plotNumber,
      paidDate,
      check,
      bank,
      chequeNumber,
      challanNo,
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

      const miscellaneousExpense = new MiscellaneousExpense({
        paidDate: paidDate,
        mainHeadOfAccount: mainHeadOfAccount,
        subHeadOfAccount: subHeadOfAccount,
        amount: amount,
        vendor: vendor,
        plotNumber: plotNumber,
        description: description,
        bank: bank ? bank : null,
        ...(check === "Bank"
          ? { chequeNumber: chequeNumber }
          : { chequeNumber: undefined }),
        check: check,
        challanNo: challanNo,
      });

      const update_id = miscellaneousExpense._id;

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

      await miscellaneousExpense.save();
      res.status(201).json({
        status: "success",
        message: "Miscellaneous Expense created successfully",
        data: miscellaneousExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getMiscellaneousExpense: async (req, res) => {
    const { headOfAccount } = req.query;

    try {
      let query = {};

      if (headOfAccount) {
        const mainHeadOfAccount = await MainHeadOfAccount.findOne({
          headOfAccount: headOfAccount,
        }).exec();
        const subHeadOfAccount = await SubExpenseHeadOfAccount.findOne({
          headOfAccount: headOfAccount,
        }).exec();

        if (mainHeadOfAccount) {
          query.mainHeadOfAccount = mainHeadOfAccount._id;
        } else if (subHeadOfAccount) {
          query.subHeadOfAccount = subHeadOfAccount._id;
        } else {
          return res.status(404).json({ message: "Head of Account not found" });
        }
      }

      const miscellaneousExpense = await MiscellaneousExpense.find(query)
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .exec();

      if (miscellaneousExpense.length === 0) {
        return res
          .status(404)
          .json({ message: "Miscellaneous Expense not found" });
      }

      res.status(200).json(miscellaneousExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateMiscellaneousExpense: async (req, res) => {
    const { id } = req.query;
    const {
      amount,
      description,
      vendor,
      plotNumber,
      paidDate,
      check,
      bank,
      chequeNumber,
      challanNo,
    } = req.body;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const miscellaneousExpense = await MiscellaneousExpense.findById(
        id
      ).exec();
      if (!miscellaneousExpense) {
        return res.status(404).json({
          status: "error",
          message: "Miscellaneous Expense not found",
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
      if (plotNumber) {
        updateData.plotNumber = plotNumber;
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

      const type = "expense";

      if (check == "Cash") {
        await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      } else if (check == "Bank") {
        await BankLedger.updateBankLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      } else {
        console.log("Invalid Check");
      }

      const updatedmiscellaneousExpense =
        await MiscellaneousExpense.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Miscellaneous Expense updated successfully",
        data: updatedmiscellaneousExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
