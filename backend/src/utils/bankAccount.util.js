const BankAccount = require("../models/bankAccount/bankAccount.model");

async function getBankAccountById(id) {
  const bankAccount = await BankAccount.findById(id);
  return bankAccount;
}

async function getBankAccountOpeningBalance(id) {
  const bankAccount = await getBankAccountById(id);
  return bankAccount?.openingBalance || 0;
}

async function getTotalBankAccountOpeningBalance() {
  let res = await BankAccount.aggregate([
    {
      $group: {
        _id: null,
        totalOpeningBalance: { $sum: "$openingBalance" },
      },
    },
  ]);
  const totalBankAccountOpeningBalance = res[0]?.totalOpeningBalance || 0;
  return totalBankAccountOpeningBalance;
}

module.exports = {
  getBankAccountById,
  getBankAccountOpeningBalance,
  getTotalBankAccountOpeningBalance,
};