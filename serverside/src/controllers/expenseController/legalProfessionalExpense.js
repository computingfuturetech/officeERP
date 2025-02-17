const Member = require("../../models/memberModels/memberList");
const LegalProfessionalExpense = require("../../models/expenseModel/legalProfessionalExpense/legalProfessionalExpense");
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
  createLegalProfessionalExpense: async (req, res) => {
    const {
      mainHeadOfAccount,
      subHeadOfAccount,
      amount,
      particular,
      vendor,
      paidDate,
      challanNo,
      chequeNumber,
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

      if (!particular) {
        return res.status(400).json({
          status: "error",
          message: "Particular is required",
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

      const legalProfessionalExpense = new LegalProfessionalExpense({
        paidDate: paidDate,
        mainHeadOfAccount: mainHeadOfAccount,
        subHeadOfAccount: subHeadOfAccount,
        amount: amount,
        particular: particular,
        vendor: vendor,
        bank: bank ? bank : null,
        ...(check === "Bank"
          ? { chequeNumber: chequeNumber }
          : { chequeNumber: undefined }),
        check: check,
        challanNo: challanNo,
      });

      const update_id = legalProfessionalExpense._id;

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

      await legalProfessionalExpense.save();
      res.status(201).json({
        status: "success",
        message: "Legal Professional Expense created successfully",
        data: legalProfessionalExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getLegalProfessionalExpense: async (req, res) => {
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

      const legalProfessionalExpense = await LegalProfessionalExpense.find(
        query
      )
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .exec();

      if (legalProfessionalExpense.length === 0) {
        return res
          .status(404)
          .json({ message: "Legal Professional Expense not found" });
      }

      res.status(200).json(legalProfessionalExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateLegalProfessionalExpense: async (req, res) => {
    const id = req.query.id;
    const {
      amount,
      particular,
      vendor,
      paidDate,
      challanNo,
      chequeNumber,
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

      const legalProfessionalExpense = await LegalProfessionalExpense.findById(
        id
      ).exec();
      if (!legalProfessionalExpense) {
        return res.status(404).json({
          status: "error",
          message: "Legal Professional Expense not found",
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
      if (vendor) {
        updateData.vendor = vendor;
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

      const updatedlegalProfessionalExpense =
        await LegalProfessionalExpense.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Legal Professiona  Expense updated successfully",
        data: updatedlegalProfessionalExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
