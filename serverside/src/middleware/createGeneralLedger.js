const CashBookLedger = require('../models/ledgerModels/cashBookLedger');
const GeneralLedger = require('../models/ledgerModels/generalLedger');
const FixedAmount = require('../models/fixedAmountModel/fixedAmount');
const CheckMainAndSubHeadOfAccount = require('../middleware/checkMainAndSubHeadOfAccount');
const IncomeHeadOfAccount = require("../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const CheckBank = require('../middleware/checkBank');
const BankBalance = require('../models/bankModel/bankBalance');

async function updateAddNextGeneralLedger(nextIds, type, difference) {
  try {
    if (type == 'expense') {
      for (const id of nextIds) {
        const temp = await GeneralLedger.findOne(
          { _id: id }
        ).exec();
        temp.balance = parseInt(temp.balance) - difference;
        temp.previousBalance = parseInt(temp.previousBalance) - difference;
        await temp.save();
      }
      console.log('Expense General Ledger updated successfully');
    }
    else if (type == 'income') {
      for (const id of nextIds) {
        const temp = await GeneralLedger.findOne(
          {_id: id }
        ).exec();
        temp.balance = parseInt(temp.balance) + difference;
        temp.previousBalance = parseInt(temp.previousBalance) + difference;
        await temp.save();
      }
      console.log('Income General Ledger updated successfully');
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateSubNextGeneralLedger(nextIds, type, difference) {
  try {
    if (type == 'expense') {
      for (const id of nextIds) {
        const temp = await GeneralLedger.findOne(
          { _id: id }
        ).exec();
        temp.balance = parseInt(temp.balance) + difference;
        temp.previousBalance = parseInt(temp.previousBalance) + difference;
        await temp.save();
      }
      console.log('Expense General Ledger updated successfully');
    }
    if (type == 'income') {
      for (const id of nextIds) {
        const temp = await GeneralLedger.findOne(
          { _id: id }
        ).exec();
        temp.balance = parseInt(temp.balance) - difference;
        temp.previousBalance = parseInt(temp.previousBalance) - difference;
        await temp.save();
      }
      console.log('Income General Ledger updated successfully');
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  createGeneralLedger: async (req, res, voucherNo, type, head_of_account, particular, amount, date, cheque_no, challan_no, update_id, bank_account) => {
    try {

      const { bank_id } = await CheckBank.checkBank(req, res, bank_account);

      let balance;
      let latestBalance = await GeneralLedger.findOne({ balance: { $exists: true } })
        .sort({
          $natural: -1
        })
        .exec();

      if (latestBalance) {
        balance = latestBalance.balance;
      } else {
        let totalBalance = await BankBalance.aggregate([
          {
            $group: {
              _id: null,
              totalBalance: { $sum: "$balance" } 
            }
          }
        ]);
        console.log(totalBalance);
        latestBalanceCash = await FixedAmount.findOne({})
          .sort({ cashOpeningBalance: -1 })
          .exec();

        balance = parseInt(latestBalanceCash.cashOpeningBalance) + parseInt(totalBalance[0].totalBalance);
      }

      const newBalance = type === 'income' ? parseInt(balance) + parseInt(amount) : parseInt(balance) - parseInt(amount);

      let main_head_id;
      let sub_head_id;
      if (type == 'expense') {
          ({ main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res));
      }

      let incomeHOF = await IncomeHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();

      const generalLedger = new GeneralLedger({
        date: date,
        voucherNo: voucherNo,
        type: type,
        headOfAccount: head_of_account,
        particular: particular,
        ...(type === 'expense' ? { debit: amount } : { credit: amount }),
        ...(type == 'expense' ? {
          ...(main_head_id ? { mainHeadOfAccount: main_head_id } : { subHeadOfAccount: sub_head_id })
        } : {
          incomeHeadOfAccount: incomeHOF._id
        }),
        challanNo: challan_no,
        chequeNo: cheque_no,
        balance: newBalance,
        updateId: update_id,
        previousBalance: balance,
        bank: bank_id
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
      const updateFields = { ...updates };
      delete updateFields.amount;
      const generalLedger = await GeneralLedger.findOneAndUpdate({ updateId: updateId }, { $set: updateFields }, { new: true }).exec();
      if (!generalLedger) {
        return res.status(404).json({ message: 'General Ledger not found' });
      }
      if (type == 'expense') {
        if (updates.amount) {
          if (updates.amount == generalLedger.debit) {
            generalLedger.debit = updates.amount;
            await generalLedger.save();
          } else {
            const { debit: previous_amount } = generalLedger;
            generalLedger.debit = updates.amount;
            generalLedger.balance = parseInt(generalLedger.previousBalance) - parseInt(updates.amount);
            const nextGeneralLedgers = await GeneralLedger.find({ _id: { $gt: generalLedger._id } }).exec();
            const nextIds = nextGeneralLedgers.map(gl => gl._id);
            if (updates.amount > previous_amount) {
              const difference = updates.amount - previous_amount;
              await updateAddNextGeneralLedger(nextIds, "expense", difference);
            } else if (updates.amount < previous_amount) {
              const difference = previous_amount - updates.amount;
              await updateSubNextGeneralLedger(nextIds, "expense", difference);
            }

            await generalLedger.save();
          }
          console.log('General Ledger A updated successfully');
        }
      }
      else if(type == "income") {
        if (updates.amount) {
          if (updates.amount == generalLedger.credit) {
            generalLedger.credit = updates.amount;
            await generalLedger.save();
          } else {
            const { credit: previous_amount } = generalLedger;
            generalLedger.credit = updates.amount;
            generalLedger.balance = parseInt(generalLedger.previousBalance) + parseInt(updates.amount);
            const nextGeneralLedgers = await GeneralLedger.find({ _id: { $gt: generalLedger._id } }).exec();
            const nextIds = nextGeneralLedgers.map(gl => gl._id);
            if (updates.amount > previous_amount) {
              const difference = updates.amount - previous_amount;
              await updateAddNextGeneralLedger(nextIds, "income", difference);
            } else if (updates.amount < previous_amount) {
              const difference = previous_amount - updates.amount;
              await updateSubNextGeneralLedger(nextIds, "income", difference);
            }

            await generalLedger.save();
          }
          console.log('General Ledger A updated successfully');
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  updateSellerPurchaserPossessionGeneralLedger: async (req, res, updateId, updates, type, nameHeadOfAccount) => {
    const updateFields = { ...updates };
    delete updateFields.amount;
    delete updateFields._id;
    try {
        const generalLedger = await GeneralLedger.findOneAndUpdate(
            { updateId: updateId, headOfAccount: nameHeadOfAccount },
            { $set: updateFields },
            { new: true }
        ).exec();
        if (!generalLedger) {
            return res.status(404).json({ message: 'General Ledger not found' });
        }
        if (type == 'income') {
            if (updates.amount) {
                if (updates.amount == generalLedger.credit) {
                  generalLedger.credit = updates.amount;
                    await generalLedger.save();
                } else {
                    const { credit: previous_amount } = generalLedger;
                    generalLedger.credit = updates.amount;
                    generalLedger.balance = parseInt(generalLedger.previousBalance) + parseInt(updates.amount);
                    const nextGeneralLedgers = await GeneralLedger.find({ _id: { $gt: generalLedger._id } }).exec();
                    const nextIds = nextGeneralLedgers.map(gl => gl._id);
                    if (updates.amount > previous_amount) {
                        const difference = updates.amount - previous_amount;
                        await updateAddNextGeneralLedger(nextIds, "income", difference);
                    } else if (updates.amount < previous_amount) {
                        const difference = previous_amount - updates.amount;
                        await updateSubNextGeneralLedger(nextIds, "income", difference);
                    }

                    await generalLedger.save();
                }
                console.log('General Ledger updated successfully');
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
};


