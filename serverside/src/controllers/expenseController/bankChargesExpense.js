const Member = require("../../models/memberModels/memberList");
const BankChargesExpense = require("../../models/expenseModel/bankChargesExpense/bankChargesExpense");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const CheckMainAndSubHeadOfAccount = require("../../middleware/checkMainAndSubHeadOfAccount");
const BankList = require("../../models/bankModel/bank");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");
const VoucherNo = require("../../middleware/generateVoucherNo");
const CheckBank = require("../../middleware/checkBank");

module.exports = {
  createBankChargesExpense: async (req, res) => {
    const {
      headOfAccount,
      amount,
      paidDate,
      particular,
      challanNo,
      chequeNumber,
      bank,
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

      if (!headOfAccount) {
        return res.status(400).json({
          status: "error",
          message: "Head of Account is required",
        });
      }

      if (!bank) {
        return res.status(400).json({
          status: "error",
          message: "Bank is required",
        });
      }

      const bankFound = await BankList.findOne({
        accountNo: bank,
      });
      if (!bankFound) {
        return res.status(400).json({
          status: "error",
          message: "Invalid Bank Account Number",
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

      if (bankId === null) {
        return res.status(400).json({
          status: "error",
          message: "Bank not found",
        });
      }

      const bankChargesExpense = new BankChargesExpense({
        paidDate: paidDate,
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
        amount: amount,
        bank: bankId ? bankId : null,
        particular: particular,
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
      if (req.body.paidDate) {
        updateData.paidDate = req.body.paidDate;
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.particular) {
        updateData.particular = req.body.particular;
      }
      if (req.body.challanNo) {
        updateData.challanNo = req.body.challanNo;
      }
      if (req.body.chequeNumber) {
        updateData.chequeNumber = req.body.chequeNumber;
      }
      if (req.body.bank) {
        const bankFound = await BankList.findOne({
          accountNo: req.body.bank,
        });
        if (!bankFound) {
          return res.status(400).json({
            status: "error",
            message: "Invalid Bank Account Number",
          });
        }
        updateData.bank = bankFound._id;
      }
      if (req.body.headOfAccount) {
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(
          req,
          res,
          updateData,
          bankChargesExpense
        );
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
