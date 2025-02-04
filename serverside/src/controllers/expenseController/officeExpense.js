const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount");
const OfficeExpense = require("../../models/expenseModel/officeExpense/officeExpense");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const CheckMainAndSubHeadOfAccount = require("../../middleware/checkMainAndSubHeadOfAccount");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");
const VoucherNo = require("../../middleware/generateVoucherNo");
const CashBookLedger = require("../../middleware/createCashBookLedger");
const CheckBank = require("../../middleware/checkBank");
const BankList = require("../../models/bankModel/bank");

module.exports = {
  createOfficeExpense: async (req, res) => {
    const {
      mainHeadOfAccount,
      subHeadOfAccount,
      amount,
      particular,
      vendor,
      paidDate,
      check,
      bank,
      chequeNumber,
      challanNo,
    } = req.body;

    try {
      if (!mainHeadOfAccount && !subHeadOfAccount) {
        return res.status(400).json({
          status: "error",
          message: "Head of Account is required",
        });
      }
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
      if (!vendor) {
        return res.status(400).json({
          status: "error",
          message: "Vendor is required",
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

      const officeExpense = new OfficeExpense({
        paidDate: paidDate,
        mainHeadOfAccount: mainHeadOfAccount,
        subHeadOfAccount: subHeadOfAccount,
        amount: amount,
        particular: particular,
        vendor: vendor,
        ...(check === "Bank"
          ? { chequeNumber: chequeNumber }
          : { chequeNumber: undefined }),
        bank: bank ? bank : null,
        check: check,
        challanNo: challanNo,
      });

      const update_id = officeExpense._id;

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

      await officeExpense.save();
      res.status(201).json({
        status: "success",
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
    const {
      amount,
      particular,
      vendor,
      paidDate,
      check,
      bank,
      chequeNumber,
      challanNo,
    } = req.body;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }

      const officeExpense = await OfficeExpense.findById(id).exec();
      if (!officeExpense) {
        return res.status(404).json({
          status: "error",
          message: "Office Expense not found",
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
      // if (req.body.head_of_account) {
      //   await CheckMainAndSubHeadOfAccount.getHeadOfAccount(
      //     req,
      //     res,
      //     updateData,
      //     officeExpense
      //   );
      // }

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

      const updatedOfficeExpense = await OfficeExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
        status: "success",
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
