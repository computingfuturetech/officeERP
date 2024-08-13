const BankList = require('../models/bankModel/bank');
const BankLedger=require('../models/ledgerModels/bankLedger')
const CashLedger=require('../models/ledgerModels/cashLedger')

module.exports = {
    generateBankVoucherNo: async (req, res, accountNo, type) => {
        try {
            const bank = await BankList.findOne({ accountNo: accountNo });
            if (!bank) {
                return res.status(404).send("Bank not found");
            }
            const bankName = bank.bankName
            const narration = bankName.match(/\(([^)]+)\)/)[1];
            const lastTwoDigits = accountNo.slice(-2);
            const prefix = type === "income" ? "BRV" : "BPV";
            const latestVoucher = await BankLedger.findOne({})
            .sort({ voucherNo: -1 })
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
            return res.status(200).send({ voucherNo });
        } catch (error) {
            console.error("Error generating voucher number:", error);
            return res.status(500).send("An error occurred while generating the voucher number");
        }
    },
    generateCashVoucherNo: async (req, res, type) => {
        try {
            const prefix = type === "income" ? "CRV" : "CPV";

            const latestVoucher = await CashLedger.findOne({})
            .sort({ voucherNo: -1 })
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
            return res.status(200).send({ voucherNo });
        } catch (error) {
            console.error("Error generating voucher number:", error);
            return res.status(500).send("An error occurred while generating the voucher number");
        }
    }
};