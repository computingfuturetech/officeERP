const OfficeUtilExpense = require("../../models/expenseModel/officeUtilExpense/officeutilExpense");
const CheckMainAndSubHeadOfAccount = require("../../middleware/checkMainAndSubHeadOfAccount");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");
const VoucherNo = require("../../middleware/generateVoucherNo");
const CashBookLedger = require("../../middleware/createCashBookLedger");
const BankList = require("../../models/bankModel/bank");

module.exports = {
  createOfficeUtilExpense: async (req, res) => {
    const {
      headOfAccount,
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
      if (!headOfAccount) {
        return res.status(400).json({
          status: "error",
          message: "Head of Account is required",
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

      // const { bankId } = await CheckBank.checkBank(req, res, bank);

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
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
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
      if (req.body.advTax) {
        updateData.advTax = req.body.advTax;
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

      const type = "expense";

      if (req.body.check == "Cash") {
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
    const { billingMonth } = req.query;
    try {
      let officeUtilExpense;
      if (billingMonth) {
        officeUtilExpense = await OfficeUtilExpense.find({
          billingMonth: billingMonth,
        })
          .populate("mainHeadOfAccount")
          .populate("subHeadOfAccount")
          .populate("bank", "bankName bankBranch accountNo")
          .exec();
        return res.status(200).json({
          status: "success",
          message: "Office Utility Expense fetched successfully",
          data: officeUtilExpense,
        });
      }
      officeUtilExpense = await OfficeUtilExpense.find()
        .populate("mainHeadOfAccount")
        .populate("subHeadOfAccount")
        .populate("bank", "bankName bankBranch accountNo")
        .exec();
      return res.status(200).json({
        status: "success",
        message: "Office Utility Expense fetched successfully",
        data: officeUtilExpense,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
