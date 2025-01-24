const AuditFeeExpense = require("../../models/expenseModel/auditFeeExpense/auditFeeExpense");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const CheckMainAndSubHeadOfAccount = require("../../middleware/checkMainAndSubHeadOfAccount");
const VoucherNo = require("../../middleware/generateVoucherNo");
const CashBookLedger = require("../../middleware/createCashBookLedger");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");
const CheckBank = require("../../middleware/checkBank");

module.exports = {
  createAuditFeeExpense: async (req, res) => {
    const {
      headOfAccount,
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

      if (!headOfAccount) {
        return res.status(400).json({
          status: "error",
          message: "Head of Account is required",
        });
      }

      if (!amount) {
        return res.status(400).json({
          status: "error",
          message: "Amount is required",
        });
      }

      let main_head_id;
      let sub_head_id;
      if (req.body.headOfAccount) {
        ({ main_head_id, sub_head_id } =
          await CheckMainAndSubHeadOfAccount.checkHeadOfAccount(
            req,
            res,
            headOfAccount
          ));
      }

      const { bankId } = await CheckBank.checkBank(req, res, bank);

      if (check === "Bank" && bankId === null) {
        return res.status(400).json({
          status: "error",
          message: "Bank is required",
        });
      }

      const auditFeeExpense = new AuditFeeExpense({
        paidDate: paidDate,
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
        amount: amount,
        year: year,
        particular: particular,
        bank: bankId ? bankId : null,
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
      if (req.body.paidDate) {
        updateData.paidDate = req.body.paidDate;
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.year) {
        updateData.year = req.body.year;
      }
      if (req.body.particular) {
        updateData.particular = req.body.particular;
      }
      if (req.body.challanNo) {
        updateData.challanNo = req.body.challanNo;
      }
      if (req.body.chequeNumber) {
        updateData.chequeNo = req.body.chequeNumber;
      }
      if (req.body.headOfAccount) {
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(
          req,
          res,
          updateData,
          auditFeeExpense
        );
      }
      const updatedAuditFeeExpense = await AuditFeeExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      const type = "expense";

      if (req.body.check == "Cash") {
        await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
        await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      } else if (req.body.check == "Bank") {
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
