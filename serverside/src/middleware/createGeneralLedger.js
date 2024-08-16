const CashBookLedger = require('../models/ledgerModels/cashBookLedger');
const GeneralLedger = require('../models/ledgerModels/generalLedger');
const FixedAmount = require('../models/fixedAmountModel/fixedAmount');

module.exports = {
  createGeneralLedger: async (req, res, voucherNo, type, head_of_account, particular, amount, date, cheque_no, challan_no, update_id) => {
    try {
      let balance;
      let latestBalance = await GeneralLedger.findOne({ balance: { $exists: true } })
        .sort({
          $natural: -1
        })
        .exec();

      if (latestBalance) {
        balance = latestBalance.balance;
      } else {
        latestBalanceCash = await FixedAmount.findOne({})
          .sort({ cashOpeningBalance: -1 })
          .exec();
        latestBalanceBank = await FixedAmount.findOne({})
          .sort({ bankOpeningBalance: -1 })
          .exec();
        balance = parseInt(latestBalanceCash.cashOpeningBalance) + parseInt(latestBalanceBank.bankOpeningBalance);
      }

      const newBalance = type === 'income' ? parseInt(balance) + parseInt(amount) : parseInt(balance) - parseInt(amount);

      const generalLedger = new GeneralLedger({
        date: date,
        voucherNo: voucherNo,
        type: type,
        headOfAccount: head_of_account,
        particular: particular,
        ...(type === 'expense' ? { debit: amount } : { credit: amount }),
        challanNo: challan_no,
        chequeNo: cheque_no,
        balance: newBalance,
        updateId: update_id,
        previousBalance: balance
      });
      await generalLedger.save();
      console.log("General Ledger created successfully");
    } catch (err) {
      console.log("General Ledger not created");
      return res.status(500).json({ message: err });
    }
  },
  updateGeneralLedger: async (req, res, updateId, updates, type) => {
    try {
      if (type == 'expense') {
        const generalLedger = await GeneralLedger.findOneAndUpdate({ updateId: updateId }, { new: true }).exec();

        if (!generalLedger) {
          return res.status(404).json({ message: 'General Ledger not found' });
        }

        if (updates.amount == generalLedger.debit) {
          generalLedger.debit = updates.amount;
          await generalLedger.save();
        } else {
          generalLedger.debit = updates.amount;
          generalLedger.balance = parseInt(generalLedger.previousBalance) - parseInt(updates.amount);
          await generalLedger.save();
        }
        console.log('General Ledger updated successfully');

        const nextGeneralLedgers = await GeneralLedger.find({ _id: { $gt: generalLedger._id } }).exec();

        const nextIds = nextGeneralLedgers.map(gl => gl._id);
        console.log(nextIds);

      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};


