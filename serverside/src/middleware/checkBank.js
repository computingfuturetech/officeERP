const BankList = require("../models/bankModel/bank");

module.exports = {
    checkBank: async (req, res, bank_account) => {
        if (!bank_account) {
          return { bank_id: null }; 
        }
        const bank = await BankList.findOne({ accountNo: bank_account });
        if (!bank) {
          throw new Error("Invalid Bank Account Number");
        }
        return { bank_id: bank._id };
      },
};