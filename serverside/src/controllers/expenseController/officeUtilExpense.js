const OfficeUtilExpense = require("../../models/expenseModel/officeUtilExpense/officeutilExpense");
const CheckMainAndSubHeadOfAccount = require("../../middleware/checkMainAndSubHeadOfAccount");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");
const VoucherNo = require("../../middleware/generateVoucherNo");
const CashBookLedger = require("../../middleware/createCashBookLedger");
const BankList = require("../../models/bankModel/bank");
const MainExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");

module.exports = {
  createOfficeUtilExpense: async (req, res) => {
    const {
      mainHeadOfAccount,
      subHeadOfAccount,
      billingMonth,
      amount,
      billReference,
      advTax,
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
      if (!billingMonth) {
        return res.status(400).json({
          status: "error",
          message: "Billing Month is required",
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

      const officeUtilExpense = new OfficeUtilExpense({
        paidDate: paidDate,
        mainHeadOfAccount: mainHeadOfAccount,
        subHeadOfAccount: subHeadOfAccount,
        billingMonth: billingMonth,
        amount: amount,
        billReference: billReference,
        advTax: advTax,
        bank: bank ? bank : null,
        challanNo: challanNo,
        ...(check === "Bank"
          ? { chequeNumber: chequeNumber, bankAccount: bank }
          : { chequeNumber: undefined, bankAccount: undefined }),
        check: check,
      });

      officeUtilExpense.updateOne({
        $unset: { chequeNumber: "", bankAccount: "" },
      });

      const update_id = officeUtilExpense._id;

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
          billingMonth,
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
          billingMonth,
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
          billingMonth,
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
          billingMonth,
          amount,
          paidDate,
          chequeNumber,
          challanNo,
          update_id,
          bank
        );
      }

      await officeUtilExpense.save();
      res.status(201).json({
        status: "success",
        message: "OfficeUtility Expense created successfully",
        data: officeUtilExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateOfficeUtilExpense: async (req, res) => {
    const { id } = req.query;
    const {
      billingMonth,
      amount,
      billReference,
      advTax,
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
      const officeUtilExpense = await OfficeUtilExpense.findById(id).exec();
      if (!officeUtilExpense) {
        return res.status(404).json({
          status: "error",
          message: "Office Utility Expense not found",
        });
      }
      const updateData = {};
      if (paidDate) {
        updateData.paidDate = paidDate;
      }
      if (billingMonth) {
        updateData.billingMonth = billingMonth;
      }
      if (amount) {
        updateData.amount = amount;
      }
      if (advTax) {
        updateData.advTax = advTax;
      }
      if (billReference) {
        updateData.billReference = billReference;
      }
      if (challanNo) {
        updateData.challanNo = challanNo;
      }
      if (chequeNumber) {
        updateData.chequeNo = chequeNumber;
      }
      if (bank) {
        updateData.bank = bank;
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

      const updatedOfficeUtilExpense =
        await OfficeUtilExpense.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();
      res.status(200).json({
        status: "success",
        message: "Office Utility  Expense updated successfully",
        data: updatedOfficeUtilExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getOfficeUtilExpense: async (req, res) => {
    const { billingMonth, page = 1, limit = 10 } = req.query;

    try {
      let filter = {};
      if (billingMonth) {
        filter.billingMonth = billingMonth;
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [
          { path: "mainHeadOfAccount", select: "headOfAccount" },
          { path: "subHeadOfAccount", select: "headOfAccount" },
          { path: "bank", select: "bankName bankBranch accountNo" },
        ],
        sort: { createdAt: -1 },
      };

      const officeUtilExpense = await OfficeUtilExpense.paginate(
        filter,
        options
      );

      const bankList = await BankList.find().select(
        "bankName branchName, accountNo"
      );

      const listOfHeadOfAccount = await MainExpenseHeadOfAccount.find()
        .select("headOfAccount")
        .exec();

      return res.status(200).json({
        status: "success",
        message: "Office Utility Expense fetched successfully",
        data: officeUtilExpense.docs,
        filters: {
          bankList: bankList,
          headOfAccount: listOfHeadOfAccount,
        },
        pagination: {
          totalDocs: officeUtilExpense.totalDocs,
          totalPages: officeUtilExpense.totalPages,
          currentPage: officeUtilExpense.page,
          limit: officeUtilExpense.limit,
          hasNextPage: officeUtilExpense.hasNextPage,
          hasPrevPage: officeUtilExpense.hasPrevPage,
        },
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },
};
