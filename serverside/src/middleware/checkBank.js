const BankList = require("../models/bankModel/bank");

module.exports = {
  checkBank: async (req, res, bank_account) => {
    if (!bank_account) {
      return { bank_id: null };
    }
    const bank = await BankList.findOne({
      accountNo: bank_account,
    });
    if (!bank) {
      return { bankId: null };
    }
    return { bankId: bank._id, bankName: bank.bankName };
  },
};
