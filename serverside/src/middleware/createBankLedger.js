const BankLedger = require('../models/ledgerModels/bankLedger');
const GeneralLedger = require('../models/ledgerModels/generalLedger');
const FixedAmount = require('../models/fixedAmountModel/fixedAmount');

async function updateAddNextBankLedger(nextIds, type, difference) {
    try {
        for (const id of nextIds) {
            const temp =  await BankLedger.findOne(
                { _id: id }
            ).exec();
            temp.balance = parseInt(temp.balance) - difference;
            temp.debit = parseInt(temp.debit) + difference;
            await temp.save();
        }
        console.log('Bank Ledgers B updated successfully');
    } catch (err) {
        console.error(err);
    }
}

async function updateSubNextBankLedger(nextIds, type, difference) {
    try {
        for (const id of nextIds) {
            const temp =  await BankLedger.findOne(
                { _id: id }
            ).exec();
            temp.balance = parseInt(temp.balance) + difference;
            temp.debit = parseInt(temp.debit) - difference;
            await temp.save();
        }
        console.log('Bank Ledgers B updated successfully');
    } catch (err) {
        console.error(err);
    }
}


module.exports = {
    createBankLedger: async (req, res, voucherNo, type, head_of_account, particular, amount, date, cheque_no, challan_no, update_id) => {
        try {
            let balance;
            let latestBalance = await BankLedger.findOne({ balance: { $exists: true } })
                .sort({
                    $natural: -1
                })
                .exec();

            if (latestBalance) {
                balance = latestBalance.balance;
            } else {
                latestBalance = await FixedAmount.findOne({})
                    .sort({ bankOpeningBalance: -1 })
                    .exec();
                balance = latestBalance.bankOpeningBalance;
            }

            const newBalance = type === 'income' ? parseInt(balance) + parseInt(amount) : parseInt(balance) - parseInt(amount);

            const bankLedger = new BankLedger({
                date: date,
                voucherNo: voucherNo,
                type: type,
                headOfAccount: head_of_account,
                particular: particular,
                ...(type == 'expense' ? { debit: amount } : { credit: amount }),
                balance: newBalance,
                chequeNo: cheque_no,
                challanNo: challan_no,
                updateId: update_id,
                previousBalance: balance
            });
            await bankLedger.save();
            console.log("Bank Ledger created successfully");
        } catch (err) {
            return res.status(500).json({ message: err });
        }
    },
    updateBankLedger: async (req, res, updateId, updates, type) => {
        try {
          if (type == 'expense') {
            const bankLedger = await BankLedger.findOneAndUpdate({ updateId: updateId }, { new: true }).exec();
      
            if (!bankLedger) {
              return res.status(404).json({ message: 'Bank Ledger not found' });
            }
      
            if (updates.amount == bankLedger.debit) {
              bankLedger.debit = updates.amount;
              await bankLedger.save();
            } else {
              const { debit: previous_amount } = bankLedger;
              bankLedger.debit = updates.amount;
              bankLedger.balance = parseInt(bankLedger.previousBalance) - parseInt(updates.amount);
              const nextBankLedgers = await BankLedger.find({ _id: { $gt: bankLedger._id } }).exec();
              const nextIds = nextBankLedgers.map(gl => gl._id);
              if (updates.amount > previous_amount) {
                const difference = updates.amount - previous_amount;
                await updateAddNextBankLedger(nextIds, "expense", difference);
              }else if (updates.amount < previous_amount) {
                const difference = previous_amount - updates.amount;
                await updateSubNextBankLedger(nextIds, "expense", difference);
              }

              await bankLedger.save();
            }
            console.log('Bank Ledger A updated successfully');
          }
        } catch (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }
      },
};



