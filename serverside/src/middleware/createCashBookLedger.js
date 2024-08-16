const CashBookLedger = require('../models/ledgerModels/cashBookLedger');
const GeneralLedger = require('../models/ledgerModels/generalLedger');
const FixedAmount = require('../models/fixedAmountModel/fixedAmount');

module.exports = {
    createCashBookLedger: async (req, res, voucherNo, type, head_of_account, particular, amount, date) => {
      try {
        let balance;
        let latestBalance = await GeneralLedger.findOne({balance:{$exists:true}})
            .sort({
                $natural: -1 
            })
            .exec();
  
        if (latestBalance) {
          balance = latestBalance.balance;
        } else {
          latestBalance = await FixedAmount.findOne({})
            .sort({ openingBalance: -1 })
            .exec();
          balance = latestBalance.openingBalance; 
        }
  
        const newBalance = type === 'income' ? parseInt(balance) + parseInt(amount) : parseInt(balance) - parseInt(amount);
  
        const cashLedger = new CashBookLedger({
          date: date,
          voucherNo: voucherNo,
          type: type,
          headOfAccount: head_of_account,
          particular: particular,
          ...(type === 'expense' ? { debit: amount } : { credit: amount }),
          balance: newBalance,
        });
        await cashLedger.save();
        console.log("Cash Ledger created successfully");
      } catch (err) {
        return res.status(500).json({ message: err });
      }
    },
  };


