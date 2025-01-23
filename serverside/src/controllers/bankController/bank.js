const BankList = require("../../models/bankModel/bank");

module.exports = {
  createBank: async (req, res) => {
    const {
      bankName,
      accountNo,
      branchName,
      branchCode,
      accountName,
      accountType,
    } = req.body;

    try {
      if (!bankName) {
        return res.status(404).json({ message: "Bank Name is Required" });
      }

      if (!accountNo) {
        return res.status(404).json({ message: "Account Number is Required" });
      }

      if (!branchName) {
        return res.status(404).json({ message: "Branch Name is Required" });
      }

      if (!branchCode) {
        return res.status(404).json({ message: "Branch Code is Required" });
      }

      if (!accountName) {
        return res.status(404).json({ message: "Account Name is Required" });
      }

      if (!accountType) {
        return res.status(404).json({ message: "Account Type is Required" });
      }

      const foundBank = await BankList.findOne({
        accountNo: accountNo,
        branchName: branchName,
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

      res.status(201).json({
        status: "success",
        message: "Bank created successfully",
        data: bank,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  getBankList: async (req, res) => {
    try {
      const { id } = req.query;
      let bankList;
      if (id) {
        bankList = await BankList.findById(id);
        if (!bankList) {
          return res.status(404).json({
            status: "error",
            message: "Bank not found",
          });
        }
        return res.status(200).json({
          status: "success",
          message: "Bank found",
          data: [bankList],
        });
      }

      bankList = await BankList.find();

      res.status(200).json({
        status: "success",
        message: "Bank found",
        data: bankList,
      });
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  },
};
