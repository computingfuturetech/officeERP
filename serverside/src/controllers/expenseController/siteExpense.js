const SiteExpense = require("../../models/expenseModel/siteExpense/siteExpense");
const GeneralLedger = require("../../services/createGeneralLedger");
const BankLedger = require("../../services/createBankLedger");
const VoucherNo = require("../../services/generateVoucherNo");
const CashBookLedger = require("../../services/createCashBookLedger");
const BankList = require("../../models/bankModel/bank");

module.exports = {
  createSiteExpense: async (req, res) => {
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

      const siteExpense = new SiteExpense({
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

      const update_id = siteExpense._id;

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

      await siteExpense.save();
      res.status(201).json({
        status: "success",
        message: "Office Expense created successfully",
        data: siteExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateSiteExpense: async (req, res) => {
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

      const siteExpense = await SiteExpense.findById(id).exec();
      if (!siteExpense) {
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
      //     siteExpense
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

      const updatedSiteExpense = await SiteExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
        status: "success",
        message: "Office Expense updated successfully",
        data: updatedSiteExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
