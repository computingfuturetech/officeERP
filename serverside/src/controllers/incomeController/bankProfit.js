const BankList = require("../../models/bankModel/bank");
const BankProfit = require("../../models/incomeModels/bankProfitModels/bankProfit");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const VoucherNo = require("../../middleware/generateVoucherNo");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");

module.exports = {
  createBankProfit: async (req, res) => {
    const {
      amount,
      bank,
      profitMonth,
      paidDate,
      challanNo,
      chequeNumber,
      headOfAccount,
    } = req.body;
    try {
      if (!amount) {
        return res.status(400).json({
          status: "error",
          message: "Amount is required",
        });
      }

      if (!bank) {
        return res.status(400).json({
          status: "error",
          message: "Bank is required",
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

      const incomeHeadOfAccount = await IncomeHeadOfAccount.findById(
        headOfAccount
      ).exec();
      if (!incomeHeadOfAccount) {
        return res.status(404).json({
          status: "error",
          message: "Income head of account not found",
        });
      }

      const bankList = await BankList.findById(bank).exec();
      if (!bankList) {
        return res.status(404).json({
          status: "error",
          message: "Bank not found",
        });
      }
      const bankProfit = new BankProfit({
        amount: amount,
        bank: bank,
        profitMonth: profitMonth,
        paidDate: paidDate,
        headOfAccount: headOfAccount,
        chequeNumber: chequeNumber,
        challanNo: challanNo,
      });
      const update_id = bankProfit._id;
      const type = "income";
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
        profitMonth,
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
        profitMonth,
        amount,
        paidDate,
        chequeNumber,
        challanNo,
        update_id,
        bank
      );

      await bankProfit.save();

      const newBankProfit = await BankProfit.findById(bankProfit._id)
        .populate("bank", "bankName accountNo")
        .populate("headOfAccount", "headOfAccount")
        .exec();

      res.status(201).json({
        status: "success",
        message: "Bank profit created successfully",
        data: newBankProfit,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateBankProfit: async (req, res) => {
    const id = req.query.id;
    const { amount, bank, profitMonth, paidDate, challanNo, chequeNumber } =
      req.body;
    try {
      const bankProfit = await BankProfit.findById(id)
        .populate("bank", "bankName accountNo")
        .populate("headOfAccount", "headOfAccount")
        .exec();
      if (!bankProfit) {
        return res.status(404).json({
          status: "error",
          message: "Bank Profit not found",
        });
      }
      const updateData = {};
      if (bank) {
        const bankList = await BankList.findById(bank);
        if (!bankList) {
          return res.status(404).json({
            status: "error",
            message: "Bank not found",
          });
        }
        updateData.bank = bank;
      }
      if (amount) {
        updateData.amount = amount;
      }
      if (paidDate) {
        updateData.paidDate = paidDate;
      }
      if (profitMonth) {
        updateData.profitMonth = profitMonth;
      }
      if (challanNo) {
        updateData.challanNo = challanNo;
      }
      if (chequeNumber) {
        updateData.chequeNumber = chequeNumber;
      }

      updateData.headOfAccount = bankProfit.headOfAccount;

      const type = "income";
      await BankLedger.updateBankLedger(req, res, id, updateData, type);
      await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      const updatedBankProfit = await BankProfit.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      )
        .populate("bank", "bankName accountNo")
        .populate("headOfAccount", "headOfAccount")
        .exec();
      res.status(200).json({
        status: "success",
        message: "Bank Profit updated successfully",
        data: updatedBankProfit,
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },
  getBankProfits: async (req, res) => {
    const { id, bank, profitMonth, page = 1, limit = 10 } = req.query;

    try {
      let filter = {};

      if (id) {
        const bankProfit = await BankProfit.findById(id)
          .populate("bank", "bankName accountNo")
          .populate("headOfAccount", "headOfAccount")
          .exec();
        if (!bankProfit) {
          return res.status(404).json({
            status: "error",
            message: "Bank Profit not found",
          });
        }
        return res.status(200).json({
          status: "success",
          message: "Bank Profit found",
          data: bankProfit,
        });
      }

      const bankList = await BankList.find()
        .select("bankName accountNo")
        .exec();

      if (profitMonth) {
        const bankProfitValue = profitMonth.split(",");
        filter.profitMonth = { $in: bankProfitValue };
      }

      if (bank) {
        const bankValue = bank.split(",");
        filter.bank = { $in: bankValue };
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [
          { path: "bank", select: "bankName accountNo" },
          { path: "headOfAccount", select: "headOfAccount" },
        ],
        sort: { createdAt: -1 },
      };

      const bankProfits = await BankProfit.paginate(filter, options);

      const listOfHeadOfAccount = await IncomeHeadOfAccount.find()
        .select("headOfAccount")
        .exec();

      res.status(200).json({
        status: "success",
        message: bankProfits.docs.length === 0 ? "Bank Profits not found" : "Bank Profits found",
        data: bankProfits.docs,
        filters: {
          bankList: bankList,
          headOfAccount: listOfHeadOfAccount,
        },
        pagination: {
          totalDocs: bankProfits.totalDocs,
          totalPages: bankProfits.totalPages,
          currentPage: bankProfits.page,
          limit: bankProfits.limit,
          hasNextPage: bankProfits.hasNextPage,
          hasPrevPage: bankProfits.hasPrevPage,
        },
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },
};
