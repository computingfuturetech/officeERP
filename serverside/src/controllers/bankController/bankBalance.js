const BankBalance = require("../../models/bankModel/bankBalance");
const BankList = require("../../models/bankModel/bank");

module.exports = {
  createBankBalance: async (req, res) => {
    const { balance, bank } = req.body;

    try {
      if (!balance) {
        return res.status(400).json({
          status: "error",
          message: "Balance is Required",
        });
      }

      if (!bank) {
        return res.status(400).json({
          status: "error",
          message: "Bank is Required",
        });
      }

      if (bank) {
        const foundBank = await BankList.findById(bank);
        if (!foundBank) {
          return res.status(404).json({
            status: "error",
            message: "Bank Account not found",
          });
        }
      }

      const createOrUpdateBankBalance = await BankBalance.findOneAndUpdate(
        { bank: bank },
        {
          $set: { balance: balance },
        },
        {
          new: true,
          upsert: true,
        }
      );

      res.status(201).json({
        status: "success",
        message: "Bank Balance created successfully",
        data: createOrUpdateBankBalance,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
