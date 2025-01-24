const BankBalance = require("../../models/bankModel/bankBalance");
const CheckBank = require("../../middleware/checkBank");

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
          message: "Bank Account is Required",
        });
      }

      const { bankId } = await CheckBank.checkBank(req, res, bank);

      if (bankId === null) {
        return res.status(404).json({
          status: "error",
          message: "Bank Account not found",
        });
      }

      const createOrUpdateBankBalance = await BankBalance.findOneAndUpdate(
        { bank: bankId },
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
