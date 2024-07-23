const BankList = require("../../models/bankModel/bank");
const BankProfit = require("../../models/incomeModels/bankProfitModels/bankProfit");

module.exports = {
  createBankProfit: async (req, res) => {
    const { amount, bank_account, bank_name, profit_month } = req.body;
    console.log(req.body);
    try {
      if (!amount || !bank_account || !bank_name || !profit_month) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const bankList = await BankList.findOne({ accountNo: bank_account
      });
      if (!bankList) {
        return res
          .status(400)
          .json({ message: "Invalid Bank Account Number" });
      }
      const bankProfit = new BankProfit({
        amount: amount,
        bankAccount: bankList._id,
        bankName: bank_name,
        profitMonth: profit_month,
      });
      await bankProfit.save();
      res.status(200).json({
        message: "Bank profit created successfully",
        data: bankProfit
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateBankProfit: async (req, res) => {
    const id = req.query.id;
    const { amount, bank_account, bank_name, profit_month } = req.body;
    try {
      const bankProfit = await BankProfit.findById(id).exec();
      if (!bankProfit) {
        return res.status(404).json({ message: "Bank Profit not found" });
      }
      if ((bank_account && !bank_name) || (bank_name && !bank_account)) {
        return res
          .status(400)
          .json({
            message: "Both bank account and bank name are required to update",
          });
      }
      if (amount) bankProfit.amount = amount;
      if (profit_month) bankProfit.profitMonth = profit_month;
      if (bank_account && bank_name) {
        const bankList = await BankList.findOne({ accountNo: bank_account
        });
        if (!bankList) {
          return res
            .status(400)
            .json({ message: "Invalid bank_name or bank_account" });
        }
        bankProfit.bankAccount = bank_account;
        bankProfit.bankName = bank_name;
      }
      await bankProfit.save();
      res.status(200).json({
        message: "Bank Profit updated successfully",
        data: bankProfit,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  getBankProfits: async (req, res) => {
    const { id, bankname, sort } = req.query;
    let sortOrder = {};
    if (sort === 'asc') {
      sortOrder = { amount: 1 };
    } else if (sort === 'desc') {
      sortOrder = { amount: -1 };
    }
    try {
      if (id) {
        const bankProfit = await BankProfit.findById(id).exec();
        if (!bankProfit) {
          return res.status(404).json({ message: "Bank Profit not found" });
        }
        res.status(200).json(bankProfit);
      } else if (bankname) {
        const bankProfits = await BankProfit.find({ bankName: bankname }).sort(sortOrder).exec();
        if (bankProfits.length === 0) {
          return res.status(404).json({ message: "Bank Profits not found" });
        }
        res.status(200).json(bankProfits);
      } else {
        const bankProfits = await BankProfit.find().sort(sortOrder).exec();
        res.status(200).json(bankProfits);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
