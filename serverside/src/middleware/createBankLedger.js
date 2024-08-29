const BankLedger = require('../models/ledgerModels/bankLedger');
const GeneralLedger = require('../models/ledgerModels/generalLedger');
const FixedAmount = require('../models/fixedAmountModel/fixedAmount');
const IncomeHeadOfAccount = require("../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const CheckMainAndSubHeadOfAccount = require('../middleware/checkMainAndSubHeadOfAccount');
const CheckBank = require('../middleware/checkBank');
const BankBalance = require('../models/bankModel/bankBalance');

async function updateAddNextBankLedger(nextIds, type, difference) {
    try {
        if (type == 'expense') {
            for (const id of nextIds) {
                const temp = await BankLedger.findOne(
                    { _id: id }
                ).exec();
                temp.balance = parseInt(temp.balance) - difference;
                temp.previousBalance = parseInt(temp.previousBalance) - difference;
                await temp.save();
            }
            console.log('Expense of Bank Ledgers updated successfully');
        }
        else if (type == 'income') {
            for (const id of nextIds) {
                const temp = await BankLedger.findOne(
                    { _id: id }
                ).exec();
                temp.balance = parseInt(temp.balance) + difference;
                temp.previousBalance = parseInt(temp.previousBalance) + difference;
                await temp.save();
            }
            console.log('Income of Bank Ledgers updated successfully');
        }
    } catch (err) {
        console.error(err);
    }
}

async function updateSubNextBankLedger(nextIds, type, difference) {
    try {
        if (type == 'expense') {
            for (const id of nextIds) {
                const temp = await BankLedger.findOne(
                    { _id: id }
                ).exec();
                temp.balance = parseInt(temp.balance) + difference;
                temp.previousBalance = parseInt(temp.previousBalance) + difference;
                await temp.save();
            }
            console.log('Bank Ledgers B updated successfully');
        }
        else if (type == 'income') {
            for (const id of nextIds) {
                const temp = await BankLedger.findOne(
                    { _id: id }
                ).exec();
                temp.balance = parseInt(temp.balance) - difference;
                temp.previousBalance = parseInt(temp.previousBalance) - difference;
                await temp.save();
            }
            console.log('Bank Ledgers B updated successfully');
        }
    } catch (err) {
        console.error(err);
    }
}


module.exports = {
    createBankLedger: async (req, res, voucherNo, type, head_of_account, particular, amount, date, cheque_no, challan_no, update_id,bank_account) => {
        try {
            const { bank_id } = await CheckBank.checkBank(req, res, bank_account);
            let balance;
            let latestBalance = await BankLedger.findOne({ balance: { $exists: true }, bank: bank_id })
                .sort({ _id: -1 }) 
                .exec();
            if (latestBalance) {
                balance = latestBalance.balance;
            } else {
                latestBalance = await BankBalance.findOne({bank: bank_id}).exec();
                balance = latestBalance.balance;
            }
            const newBalance = type === 'income' ? parseInt(balance) + parseInt(amount) : parseInt(balance) - parseInt(amount);
            let main_head_id;
            let sub_head_id;
            if (type == 'expense') {
                ({ main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res));
            }
            let incomeHOF = await IncomeHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
            const bankLedger = new BankLedger({
                date: date,
                voucherNo: voucherNo,
                type: type,
                headOfAccount: head_of_account,
                particular: particular,
                ...(type == 'expense' ? { debit: amount } : { credit: amount }),
                ...(type == 'expense' ? {
                    ...(main_head_id ? { mainHeadOfAccount: main_head_id } : { subHeadOfAccount: sub_head_id })
                  } : {
                    incomeHeadOfAccount: incomeHOF._id
                  }),
                balance: newBalance,
                chequeNo: cheque_no,
                challanNo: challan_no,
                updateId: update_id,
                previousBalance: balance,
                bank: bank_id
            });
            await bankLedger.save();
            console.log("Bank Ledger created successfully");
        } catch (err) {
            return res.status(500).json({ message: err });
        }
    },
    updateBankLedger: async (req, res, updateId, updates, type) => {
        try {
            const updateFields = { ...updates };
            delete updateFields.amount;
            const bankLedger = await BankLedger.findOneAndUpdate({ updateId: updateId }, { $set: updateFields }, { new: true }).exec();

            if (!bankLedger) {
                return res.status(404).json({ message: 'Bank Ledger not found' });
            }
            if (type == 'expense') {
                if (updates.amount) {
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
                        } else if (updates.amount < previous_amount) {
                            const difference = previous_amount - updates.amount;
                            await updateSubNextBankLedger(nextIds, "expense", difference);
                        }

                        await bankLedger.save();
                    }
                    console.log('Bank Ledger A updated successfully');
                }
            }
            if (type == 'income') {
                if (updates.amount) {
                    if (updates.amount == bankLedger.credit) {
                        bankLedger.credit = updates.amount;
                        await bankLedger.save();
                    } else {
                        const { credit: previous_amount } = bankLedger;
                        bankLedger.credit = updates.amount;
                        bankLedger.balance = parseInt(bankLedger.previousBalance) + parseInt(updates.amount);
                        const nextBankLedgers = await BankLedger.find({ _id: { $gt: bankLedger._id } }).exec();
                        const nextIds = nextBankLedgers.map(gl => gl._id);
                        if (updates.amount > previous_amount) {
                            const difference = updates.amount - previous_amount;
                            await updateAddNextBankLedger(nextIds, "income", difference);
                        } else if (updates.amount < previous_amount) {
                            const difference = previous_amount - updates.amount;
                            await updateSubNextBankLedger(nextIds, "income", difference);
                        }

                        await bankLedger.save();
                    }
                    console.log('Bank Ledger A updated successfully');
                }
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    updateSellerPurchaserBankLedger: async (req, res, updateId, updates, type, nameHeadOfAccount) => {
        const updateFields = { ...updates };
        delete updateFields.amount;
        delete updateFields._id;
        try {
            const bankLedger = await BankLedger.findOneAndUpdate(
                { updateId: updateId, headOfAccount: nameHeadOfAccount },
                { $set: updateFields },
                { new: true }
            ).exec();
            if (!bankLedger) {
                return res.status(404).json({ message: 'Bank Ledger not found' });
            }
            if (type == 'income') {
                if (updates.amount) {
                    if (updates.amount == bankLedger.credit) {
                        bankLedger.credit = updates.amount;
                        await bankLedger.save();
                    } else {
                        const { credit: previous_amount } = bankLedger;
                        bankLedger.credit = updates.amount;
                        bankLedger.balance = parseInt(bankLedger.previousBalance) + parseInt(updates.amount);
                        const nextBankLedgers = await BankLedger.find({ _id: { $gt: bankLedger._id } }).exec();
                        const nextIds = nextBankLedgers.map(gl => gl._id);
                        if (updates.amount > previous_amount) {
                            const difference = updates.amount - previous_amount;
                            await updateAddNextBankLedger(nextIds, "income", difference);
                        } else if (updates.amount < previous_amount) {
                            const difference = previous_amount - updates.amount;
                            await updateSubNextBankLedger(nextIds, "income", difference);
                        }

                        await bankLedger.save();
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



