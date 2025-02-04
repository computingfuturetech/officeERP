const Salaries = require("../../models/expenseModel/salaries/salaries");
const SalaryType = require("../../models/expenseModel/salaries/salaryType");
const CheckMainAndSubHeadOfAccount = require("../../middleware/checkMainAndSubHeadOfAccount");
const BankList = require("../../models/bankModel/bank");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");
const VoucherNo = require("../../middleware/generateVoucherNo");
const CashBookLedger = require("../../middleware/createCashBookLedger");
const MainExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");

module.exports = {
  createSalaries: async (req, res) => {
    const {
      employeeName,
      amount,
      paidDate,
      mainHeadOfAccount,
      subHeadOfAccount,
      bank,
      chequeNumber,
      check,
      challanNo,
      particular,
    } = req.body;
    let { expenseType } = req.query;
    try {
      if (!mainHeadOfAccount && !subHeadOfAccount) {
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

      let headOfAccount = subHeadOfAccount
        ? subHeadOfAccount
        : mainHeadOfAccount;

      if (expenseType === "office") {
        expenseType = "office";
      }
      if (expenseType === "site") {
        expenseType = "site";
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

      const salaries = new Salaries({
        mainHeadOfAccount: mainHeadOfAccount,
        subHeadOfAccount: subHeadOfAccount,
        employeeName: employeeName,
        amount: amount,
        paidDate: paidDate,
        salaryType: expenseType,
        bank: bank ? bank : null,
        chequeNumber: chequeNumber,
        challanNo: challanNo,
        check: check,
        particular: particular,
      });

      const update_id = salaries._id;

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
          null
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

      await salaries.save();

      res.status(201).json({
        status: "success",
        message: "Salary created successfully",
        data: salaries,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  updateSalaries: async (req, res) => {
    const { id, expenseType } = req.query;
    const {
      employeeName,
      amount,
      paidDate,
      bank,
      chequeNumber,
      check,
      challanNo,
      particular,
    } = req.body;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }
      const existingSalary = await Salaries.findById(id).exec();
      if (!existingSalary) {
        return res.status(404).json({
          status: "error",
          message: "Salary record not found",
        });
      }
      const updateData = {};

      if (expenseType === "office") {
        expenseType = "office";
      }
      if (expenseType === "site") {
        expenseType = "site";
      }
      if (expenseType) {
        updateData.salaryType = expenseType;
      }
      if (paidDate) {
        updateData.paidDate = paidDate;
      }
      if (employeeName) {
        updateData.employeeName = employeeName;
      }
      if (amount) {
        updateData.amount = amount;
      }
      if (chequeNumber) {
        updateData.chequeNumber = chequeNumber;
      }
      if (particular) {
        updateData.particular = particular;
      }
      if (challanNo) {
        updateData.challanNo = challanNo;
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

      const updatedSalaries = await Salaries.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();
      res.status(200).json({
        status: "success",
        message: "Salary record updated successfully",
        data: updatedSalaries,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getSalaries: async (req, res) => {
    const { employeeName, page = 1, limit = 10 } = req.query;
    try {
      let filter = {};

      if (employeeName) {
        filter.employeeName = employeeName;
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: { path: "salaryType", select: "salaryType" },
        sort: { createdAt: -1 }, // Sorting by newest entries first
      };

      const salaries = await Salaries.paginate(filter, options);

      const bankList = await BankList.find().select(
        "bankName branchName, accountNo"
      );

      const listOfHeadOfAccount = await MainExpenseHeadOfAccount.find()
        .select("headOfAccount")
        .exec();

      return res.status(200).json({
        status: "success",
        message: "Salaries fetched successfully",
        data: salaries.docs,
        filters: {
          bankList: bankList,
          headOfAccount: listOfHeadOfAccount,
        },
        pagination: {
          totalDocs: salaries.totalDocs,
          totalPages: salaries.totalPages,
          currentPage: salaries.page,
          limit: salaries.limit,
          hasNextPage: salaries.hasNextPage,
          hasPrevPage: salaries.hasPrevPage,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
