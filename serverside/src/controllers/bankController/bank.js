const BankList = require("../../models/bankModel/bank");
const BankBalance = require("../../models/bankModel/bankBalance");

module.exports = {
  createBank: async (req, res) => {
    const {
      bankName,
      accountNo,
      branchName,
      branchCode,
      accountName,
      accountType,
      bankBalance,
    } = req.body;

    try {
      if (!bankName) {
        return res.status(400).json({
          status: "error",
          message: "Bank Name is Required",
        });
      }

      const match = bankName.match(/\(([^)]+)\)/);
      if (!match) {
        return res.status(400).json({
          status: "error",
          message:
            "Bank Name must include an abbreviation in parentheses. Example: 'Allied Bank (ABL)'",
        });
      }

      const abbreviation = match[1]; // Extract abbreviation (e.g., "ABL" from "Allied Bank (ABL)")

      // Check if a bank with the same abbreviation already exists
      const existingBank = await BankList.findOne({
        bankName: { $regex: `\\(${abbreviation}\\)`, $options: "i" },
      });

      if (existingBank) {
        return res.status(400).json({
          status: "error",
          message: `A bank with abbreviation (${abbreviation}) already exists.`,
        });
      }

      if (!accountNo) {
        return res.status(400).json({
          status: "error",
          message: "Account Number is Required",
        });
      }

      if (!branchName) {
        return res.status(400).json({
          status: "error",
          message: "Branch Name is Required",
        });
      }

      if (!branchCode) {
        return res.status(400).json({
          status: "error",
          message: "Branch Code is Required",
        });
      }

      if (!accountName) {
        return res.status(400).json({
          status: "error",
          message: "Account Name is Required",
        });
      }

      if (!accountType) {
        return res.status(400).json({
          status: "error",
          message: "Account Type is Required",
        });
      }

      if (!bankBalance) {
        return res.status(400).json({
          status: "error",
          message: "Bank Balance is Required",
        });
      }

      const foundBank = await BankList.findOne({
        accountNo: accountNo,
      });
      if (foundBank) {
        return res.status(409).json({
          status: "error",
          message: "Bank Account no is Already Exist",
        });
      }

      const bank = new BankList({
        bankName: bankName,
        accountNo: accountNo,
        branchName: branchName,
        branchCode: branchCode,
        accountName: accountName,
        accountType: accountType,
      });

      await bank.save();

      const bankBalanceData = new BankBalance({
        balance: parseInt(bankBalance),
        bank: bank._id,
      });

      await bankBalanceData.save();

      bank.bankBalance = bankBalanceData._id;

      await bank.save();

      const createdBank = await BankList.findById(bank._id).populate(
        "bankBalance"
      );

      res.status(201).json({
        status: "success",
        message: "Bank created successfully",
        data: createdBank,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateBank: async (req, res) => {
    const { id } = req.query;
    const {
      bankName,
      accountNo,
      branchName,
      branchCode,
      accountName,
      accountType,
      bankBalance,
    } = req.body;

    try {
      const bank = await BankList.findById(id).populate("bankBalance");
      if (!bank) {
        return res.status(404).json({
          status: "error",
          message: "Bank not found",
        });
      }

      if (bankName) {
        const match = bankName.match(/\(([^)]+)\)/);
        if (!match) {
          return res.status(400).json({
            status: "error",
            message:
              "Bank Name must include an abbreviation in parentheses. Example: 'Allied Bank (ABL)'",
          });
        }

        const abbreviation = match[1]; // Extract abbreviation (e.g., "ABL" from "Allied Bank (ABL)")

        // Exclude current bank from duplicate check using its ID
        const existingBank = await BankList.findOne({
          _id: { $ne: bank._id }, // Excludes the bank being updated
          bankName: { $regex: `\\(${abbreviation}\\)`, $options: "i" },
        });

        if (existingBank) {
          return res.status(400).json({
            status: "error",
            message: `A bank with abbreviation (${abbreviation}) already exists.`,
          });
        }

        bank.bankName = bankName; // Update bank name
      }

      if (accountNo) {
        const foundBank = await BankList.findOne({
          accountNo: accountNo,
          _id: { $ne: bank._id },
        });

        if (foundBank) {
          return res.status(409).json({
            status: "error",
            message: "Bank Account No already exists",
          });
        }

        bank.accountNo = accountNo;
      }

      if (branchName) {
        bank.branchName = branchName;
      }

      if (branchCode) {
        bank.branchCode = branchCode;
      }

      if (accountName) {
        bank.accountName = accountName;
      }

      if (accountType) {
        bank.accountType = accountType;
      }

      if (bankBalance) {
        let bankBalanceData = await BankBalance.findOne({ bank: id });
        if (!bankBalanceData) {
          bankBalanceData = new BankBalance({
            bank: id,
            balance: bankBalance,
          });
        } else {
          bankBalanceData.balance = bankBalance;
        }
        await bankBalanceData.save();
        bank.bankBalance = bankBalanceData._id;
      }

      await bank.save();

      res.status(200).json({
        status: "success",
        message: "Bank updated successfully",
        data: bank,
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err });
    }
  },
  getBankList: async (req, res) => {
    try {
      const { id, page = 1, limit = 20 } = req.query;

      if (id) {
        const bank = await BankList.findById(id)
          .populate("bankBalance", "balance")
          .exec();
        if (!bank) {
          return res.status(200).json({
            status: "success",
            message: "Bank not found",
            data: [],
          });
        }
        return res.status(200).json({
          status: "success",
          message: "Bank found",
          data: [bank],
        });
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [{ path: "bankBalance", select: "bank balance" }],
        sort: { createdAt: -1 },
      };

      const bankList = await BankList.paginate({}, options);

      res.status(200).json({
        status: "success",
        message: bankList.docs.length === 0 ? "No banks found" : "Banks found",
        data: bankList.docs,
        pagination: {
          totalDocs: bankList.totalDocs,
          totalPages: bankList.totalPages,
          currentPage: bankList.page,
          hasNextPage: bankList.hasNextPage,
          hasPrevPage: bankList.hasPrevPage,
        },
      });
    } catch (err) {
      return res.status(500).json({ status: "error", message: err.message });
    }
  },
};
