const mongoose = require('mongoose');
const BankList = require('../../models/bankModel/bank');

module.exports = {
  createBank: async (req, res) => {
    const {
      bank_name,
      account_no,
      branch_name,
      branch_code,
      account_name,
      account_type,
    } = req.body;

    console.log(req.body);

    try {
      if (!bank_name || !account_no || !branch_name || !branch_code || !account_name || !account_type) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const bank = new BankList({
        bankName: bank_name,
        accountNo: account_no,
        branchName: branch_name,
        branchCode: branch_code,
        accountName: account_name,
        accountType: account_type,
      });

      await bank.save();

      res.status(201).json({
        message: "Bank created successfully",
        data: bank,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};