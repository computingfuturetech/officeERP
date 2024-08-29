const mongoose = require('mongoose');
const BankList = require('../../models/bankModel/bank');
const BankBalance = require('../../models/bankModel/bankBalance');
const CheckBank = require('../../middleware/checkBank');

module.exports = {
  createBankBalance: async (req, res) => {
    const {
      amount,
      bank_account,
    } = req.body;

    console.log(req.body);

    try {
      if (!amount || !bank_account) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const { bank_id } = await CheckBank.checkBank(req, res, bank_account);

      const createBankBalance = new BankBalance({
        balance: amount,
        bank: bank_id,
      });

      await createBankBalance.save();

      res.status(201).json({
        message: "Bank Balance created successfully",
        data: createBankBalance,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};