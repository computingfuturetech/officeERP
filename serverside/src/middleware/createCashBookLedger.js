const CashBookLedger = require('../models/ledgerModels/cashBookLedger');
const GeneralLedger = require('../models/ledgerModels/generalLedger');
const FixedAmount = require('../models/fixedAmountModel/fixedAmount');

async function updateAddNextCashLedger(nextIds, type, difference) {
  try {
    if (type == 'expense') {
      for (const id of nextIds) {
        console.log(id);
        const temp = await CashBookLedger.findOne(
          { _id: id }
        ).exec();
        temp.balance = parseInt(temp.balance) - difference;
        temp.previousBalance = parseInt(temp.previousBalance) - difference;
        await temp.save();
      }
      console.log('Expense Cash Ledgers updated successfully');
    }
    else if (type == 'income'){
      for (const id of nextIds) {
        console.log(id);
        const temp = await CashBookLedger.findOne(
          { _id: id }
        ).exec();
        temp.balance = parseInt(temp.balance) + difference;
        temp.previousBalance = parseInt(temp.previousBalance) + difference;
        await temp.save();
      }
      console.log('Income Cash Ledgers updated successfully');
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateSubNextCashLedger(nextIds, type, difference) {
  try {
    if (type == 'expense') {
      for (const id of nextIds) {
        console.log(id);
        const temp = await CashBookLedger.findOne(
          { _id: id }
        ).exec();
        temp.balance = parseInt(temp.balance) + difference;
        temp.previousBalance = parseInt(temp.previousBalance) + difference;
        await temp.save();
      }
      console.log('Expense Cash Ledgers updated successfully');
    }
    else if (type == 'income'){
      for (const id of nextIds) {
        console.log(id);
        const temp = await CashBookLedger.findOne(
          { _id: id }
        ).exec();
        temp.balance = parseInt(temp.balance) - difference;
        temp.previousBalance = parseInt(temp.previousBalance) - difference;
        await temp.save();
      }
      console.log('Income Cash Ledgers updated successfully');
    }

  } catch (err) {
    console.error(err);
  }
}


module.exports = {
  createCashBookLedger: async (req, res, voucherNo, type, head_of_account, particular, amount, date, update_id) => {
    try {
      let balance;
      let latestBalance = await CashBookLedger.findOne({ balance: { $exists: true } })
        .sort({
          $natural: -1
        })
        .exec();

      if (latestBalance) {
        balance = latestBalance.balance;
      } else {
        latestBalance = await FixedAmount.findOne({})
          .sort({ cashOpeningBalance: -1 })
          .exec();
        balance = latestBalance.cashOpeningBalance;
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
        updateId: update_id,
        previousBalance: balance
      });
      await cashLedger.save();
      console.log("Cash Ledger created successfully");
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  },
  updateCashLedger: async (req, res, updateId, updates, type) => {
    try {
      console.log(updates);
      const updateFields = { ...updates };
      delete updateFields.amount;
      if (type == 'expense') {
        const cashLedger = await CashBookLedger.findOneAndUpdate({ updateId: updateId }, { $set: updateFields },{ new: true }).exec();

        if (!cashLedger) {
          return res.status(404).json({ message: 'Cash Ledger not found' });
        }

        if(updates.amount){
          if (updates.amount == cashLedger.debit) {
            cashLedger.debit = updates.amount;
            await cashLedger.save();
          } else {
            const { debit: previous_amount } = cashLedger;
            cashLedger.debit = updates.amount;
            cashLedger.balance = parseInt(cashLedger.previousBalance) - parseInt(updates.amount);
            const nextCashLedgers = await CashBookLedger.find({ _id: { $gt: cashLedger._id } }).exec();
            const nextIds = nextCashLedgers.map(gl => gl._id);
            if (updates.amount > previous_amount) {
              const difference = updates.amount - previous_amount;
              await updateAddNextCashLedger(nextIds, "expense", difference);
            } else if (updates.amount < previous_amount) {
              const difference = previous_amount - updates.amount;
              await updateSubNextCashLedger(nextIds, "expense", difference);
            }

            await cashLedger.save();
          }
          console.log('Cash Ledger A updated successfully');
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  updateSellerPurchaserCashLedger: async (req, res, updateId, updates, type, nameHeadOfAccount) => {
    const updateFields = { ...updates };
    delete updateFields.amount;
    try {
        const cashLedger = await CashBookLedger.findOneAndUpdate(
            { updateId: updateId, headOfAccount: nameHeadOfAccount },
            { $set: updateFields },
            { new: true }
        ).exec();
        if (!cashLedger) {
            return res.status(404).json({ message: 'Bank Ledger not found' });
        }
        console.log(cashLedger)
        if (type == 'income') {
            if (updates.amount) {
                if (updates.amount == cashLedger.credit) {
                    cashLedger.credit = updates.amount;
                    await cashLedger.save();
                } else {
                    const { credit: previous_amount } = cashLedger;
                    cashLedger.credit = updates.amount;
                    cashLedger.balance = parseInt(cashLedger.previousBalance) + parseInt(updates.amount);
                    const nextCashLedgers = await CashBookLedger.find({ _id: { $gt: cashLedger._id } }).exec();
                    const nextIds = nextCashLedgers.map(gl => gl._id);
                    if (updates.amount > previous_amount) {
                        const difference = updates.amount - previous_amount;
                        await updateAddNextCashLedger(nextIds, "income", difference);
                    } else if (updates.amount < previous_amount) {
                        const difference = previous_amount - updates.amount;
                        await updateSubNextCashLedger(nextIds, "income", difference);
                    }

                    await cashLedger.save();
                }
                console.log('Bank Ledger A updated successfully');
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
};


