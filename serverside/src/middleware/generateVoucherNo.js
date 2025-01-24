const BankList = require("../models/bankModel/bank");
const BankLedger = require("../models/ledgerModels/bankLedger");
const CashLedger = require("../models/ledgerModels/cashBookLedger");

module.exports = {
  generateBankVoucherNo: async (req, res, bank, type) => {
    try {
      const bankFound = await BankList.findOne({ accountNo: bank });
      if (!bankFound) {
        return res
          .status(400)
          .json({ status: "error", message: "Bank not found" });
      }
      const bankName = bankFound.bankName;
      const narration = bankName.match(/\(([^)]+)\)/)[1];
      const lastTwoDigits = bank.slice(-2);
      const prefix = type === "income" ? "BRV" : "BPV";
      const latestVoucher = await BankLedger.findOne({
        voucherNo: new RegExp(`^${prefix}-${narration}-${lastTwoDigits}-\\d+$`),
      })
        .sort({
          $natural: -1,
        })
        .exec();
      let lastNumber = 0;

      if (latestVoucher) {
        const match = latestVoucher.voucherNo.match(/-(\d+)$/);
        if (match) {
          lastNumber = parseInt(match[1], 10);
        }
      }
      const newNumber = lastNumber + 1;
      const voucherNo = `${prefix}-${narration}-${lastTwoDigits}-${newNumber}`;
      return voucherNo;
    } catch (error) {
      console.error("Error generating voucher number:", error);
      return res
        .status(500)
        .send("An error occurred while generating the voucher number");
    }
  },
  generateCashVoucherNo: async (req, res, type) => {
    try {
      const prefix = type === "income" ? "CRV" : "CPV";

      const latestVoucher = await CashLedger.findOne({
        voucherNo: new RegExp(`^${prefix}-\\d+$`),
      })
        .sort({
          $natural: -1,
        })
        .exec();
      let lastNumber = 0;

      if (latestVoucher) {
        const match = latestVoucher.voucherNo.match(/-(\d+)$/);
        if (match) {
          lastNumber = parseInt(match[1], 10);
        }
      }
      const newNumber = lastNumber + 1;
      const voucherNo = `${prefix}-${newNumber}`;
      return voucherNo;
    } catch (error) {
      console.error("Error generating voucher number:", error);
      return res
        .status(500)
        .send("An error occurred while generating the voucher number");
    }
  },
};
