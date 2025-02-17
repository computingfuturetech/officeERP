const AuditFeeExpense = require("../../models/expenseModel/auditFeeExpense/auditFeeExpense");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const CheckMainAndSubHeadOfAccount = require("../../services/checkMainAndSubHeadOfAccount");
const VoucherNo = require("../../services/generateVoucherNo");
const CashBookLedger = require("../../services/createCashBookLedger");
const GeneralLedger = require("../../services/createGeneralLedger");
const BankLedger = require("../../services/createBankLedger");
const CheckBank = require("../../services/checkBank");
const BankList = require("../../models/bankModel/bank");

module.exports = {
  createAuditFeeExpense: async (req, res) => {
    const {
      mainHeadOfAccount,
      subHeadOfAccount,
      amount,
      year,
      paidDate,
      check,
      particular,
      chequeNumber,
      challanNo,
      bank,
    } = req.body;

    try {
      if (!paidDate) {
        return res.status(400).json({
          status: "error",
          message: "Paid Date is required",
        });
      }

      if (!year) {
        return res.status(400).json({
          status: "error",
          message: "Year is required",
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

      const auditFeeExpense = new AuditFeeExpense({
        paidDate: paidDate,
        mainHeadOfAccount: mainHeadOfAccount,
        subHeadOfAccount: subHeadOfAccount,
        amount: amount,
        year: year,
        particular: particular,
        bank: bank ? bank : null,
        ...(check === "Bank"
          ? { chequeNumber: chequeNumber }
          : { chequeNumber: undefined }),
        challanNo: challanNo,
        check: check,
      });

      const update_id = auditFeeExpense._id;

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
          particular,
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
          particular,
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
      }

      await auditFeeExpense.save();
      return res.status(201).json({
        status: "success",
        message: "Audit Fee Expense created successfully",
        data: auditFeeExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getAuditFeeExpense: async (req, res) => {
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
          return res.status(404).json({
            status: "error",
            message: "Head of Account not found",
          });
        }
      }

      const auditFeeExpense = await AuditFeeExpense.find(query)
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .exec();

      if (auditFeeExpense.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Audit Fee Expense not found",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Audit Fee Expense found",
        data: auditFeeExpense,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateAuditFeeExpense: async (req, res) => {
    const id = req.query.id;
    const {
      amount,
      year,
      paidDate,
      check,
      particular,
      chequeNumber,
      challanNo,
      bank,
    } = req.body;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }

      const auditFeeExpense = await AuditFeeExpense.findById(id).exec();
      if (!auditFeeExpense) {
        return res.status(404).json({
          status: "error",
          message: "Audit Fee Expense not found",
        });
      }

      const updateData = {};
      if (paidDate) {
        updateData.paidDate = paidDate;
      }
      if (amount) {
        updateData.amount = amount;
      }
      if (year) {
        updateData.year = year;
      }
      if (particular) {
        updateData.particular = particular;
      }
      if (challanNo) {
        updateData.challanNo = challanNo;
      }
      if (chequeNumber) {
        updateData.chequeNo = chequeNumber;
      }
      const updatedAuditFeeExpense = await AuditFeeExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      const type = "expense";

      if (check == "Cash") {
        await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      } else if (check == "Bank") {
        await BankLedger.updateBankLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      } else {
        return res
          .status(400)
          .json({ status: "error", message: "Check is required" });
      }

      res.status(200).json({
        status: "success",
        message: "Audit Fee  Expense updated successfully",
        data: updatedAuditFeeExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
