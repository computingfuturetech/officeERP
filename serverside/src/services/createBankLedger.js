const BankLedger = require("../models/ledgerModels/bankLedger");
const GeneralLedger = require("../models/ledgerModels/generalLedger");
const FixedAmount = require("../models/fixedAmountModel/fixedAmount");
const IncomeHeadOfAccount = require("../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const CheckMainAndSubHeadOfAccount = require("../services/checkMainAndSubHeadOfAccount");
const CheckBank = require("../services/checkBank");
const BankBalance = require("../models/bankModel/bankBalance");
const MainExpenseHeadOfAccount = require("../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const SubExpenseHeadOfAccount = require("../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");

async function updateAddNextBankLedger(nextIds, type, difference) {
  try {
    if (type == "expense") {
      for (const id of nextIds) {
        const temp = await BankLedger.findOne({ _id: id }).exec();
        temp.balance = parseInt(temp.balance) - difference;
        temp.previousBalance = parseInt(temp.previousBalance) - difference;
        await temp.save();
      }
      console.log("Expense of Bank Ledgers updated successfully");
    } else if (type == "income") {
      for (const id of nextIds) {
        const temp = await BankLedger.findOne({ _id: id }).exec();
        temp.balance = parseInt(temp.balance) + difference;
        temp.previousBalance = parseInt(temp.previousBalance) + difference;
        await temp.save();
      }
      console.log("Income of Bank Ledgers updated successfully");
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateSubNextBankLedger(nextIds, type, difference) {
  try {
    if (type == "expense") {
      for (const id of nextIds) {
        const temp = await BankLedger.findOne({ _id: id }).exec();
        temp.balance = parseInt(temp.balance) + difference;
        temp.previousBalance = parseInt(temp.previousBalance) + difference;
        await temp.save();
      }
      console.log("Bank Ledgers B updated successfully");
    } else if (type == "income") {
      for (const id of nextIds) {
        const temp = await BankLedger.findOne({ _id: id }).exec();
        temp.balance = parseInt(temp.balance) - difference;
        temp.previousBalance = parseInt(temp.previousBalance) - difference;
        await temp.save();
      }
      console.log("Bank Ledgers B updated successfully");
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateNextBankLedgers(nextIds, previousBalance) {
  try {
    for (const id of nextIds) {
      const bankLegder = await BankLedger.findOne({ _id: id }).exec();
      const type = bankLegder.credit === undefined ? "debit" : "credit";
      if (type === "credit") {
        bankLegder.previousBalance = previousBalance;
        bankLegder.balance = previousBalance + bankLegder.credit;
      } else {
        bankLegder.previousBalance = previousBalance;
        bankLegder.balance = previousBalance - bankLegder.debit;
      }
      await bankLegder.save();
      previousBalance = bankLegder.balance;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createBankLedger: async (
    req,
    res,
    voucherNo,
    type,
    headOfAccount,
    particular,
    amount,
    paidDate,
    chequeNumber,
    challanNo,
    update_id,
    bank
  ) => {
    try {
      const { bankId } = await CheckBank.checkBank(req, res, bank);
      let balance;
      let latestBalance = await BankLedger.findOne({
        balance: { $exists: true },
        bank,
        date: {
          $lte: new Date(paidDate),
        },
      })
        .sort({ date: -1, createdAt: -1 })
        .exec();

      if (latestBalance !== null) {
        balance = latestBalance.balance;
      } else {
        latestBalance = await BankBalance.findOne({
          bank: bank,
        }).exec();
        if (latestBalance !== null) {
          balance = latestBalance.balance;
        } else {
          balance = 0;
        }
      }

      const newBalance =
        type === "income"
          ? parseInt(balance) + parseInt(amount)
          : parseInt(balance) - parseInt(amount);
      let main_head_id;
      let sub_head_id;
      if (type == "expense") {
        ({ main_head_id, sub_head_id } =
          await CheckMainAndSubHeadOfAccount.checkHeadOfAccount(
            req,
            res,
            headOfAccount
          ));
      }

      let mainHOF;
      let subHOF;
      let incomeHOF;

      if (type === "income") {
        incomeHOF = await IncomeHeadOfAccount.findById(headOfAccount).exec();
        headOfAccount = incomeHOF.headOfAccount;
      } else {
        mainHOF = await MainExpenseHeadOfAccount.findById(headOfAccount);
        if (!mainHOF) {
          subHOF = await SubExpenseHeadOfAccount.findById(headOfAccount);
          if (subHOF) headOfAccount = subHOF.headOfAccount;
        } else headOfAccount = mainHOF.headOfAccount;
      }

      const bankLedger = new BankLedger({
        date: paidDate,
        voucherNo: voucherNo,
        type: type,
        headOfAccount: headOfAccount,
        particular: particular,
        ...(type == "expense" ? { debit: amount } : { credit: amount }),
        ...(type == "expense"
          ? {
              ...(main_head_id
                ? { mainHeadOfAccount: main_head_id }
                : { subHeadOfAccount: sub_head_id }),
            }
          : {
              incomeHeadOfAccount: incomeHOF._id,
            }),
        balance: newBalance,
        chequeNo: chequeNumber,
        challanNo: challanNo,
        updateId: update_id,
        previousBalance: balance,
        bank: bank,
      });
      const savedBankLedger = await bankLedger.save();
      console.log("Bank Ledger created successfully");

      const nextBankLedgers = await BankLedger.find({
        _id: { $ne: savedBankLedger._id },
        date: {
          $gt: new Date(paidDate),
        },
      })
        .sort({ date: 1 })
        .exec();

      let nextIds = nextBankLedgers.map((gl) => gl._id);

      updateNextBankLedgers(nextIds, savedBankLedger.balance);

      return bankLedger;
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
  },
  updateBankLedger: async (req, res, updateId, updates, type) => {
    try {
      const updateFields = { ...updates };
      delete updateFields.amount;
      const bankLedger = await BankLedger.findOne({ updateId: updateId });

      if (!bankLedger) {
        return res.status(404).json({ message: "Bank Ledger not found" });
      }

      if (type === "income") {
        bankLedger.credit = updates.amount;
        bankLedger.balance =
          bankLedger.previousBalance + Number(updates.amount);
      } else if (type === "expense") {
        bankLedger.debit = updates.amount;
        bankLedger.balance =
          bankLedger.previousBalance - Number(updates.amount);
      }

      for (const key of Object.keys(updateFields)) {
        bankLedger[key] = updateFields[key];
      }

      const savedBankLedger = await bankLedger.save();

      const nextBankLedgers = await BankLedger.find({
        _id: { $ne: savedBankLedger._id },
        date: {
          $gte: savedBankLedger.date,
        },
        createdAt: { $gt: savedBankLedger.createdAt },
      })
        .sort({ date: 1 })
        .exec();

      let nextIds = nextBankLedgers.map((gl) => gl._id);

      updateNextBankLedgers(nextIds, bankLedger.balance);

      // if (type == "expense") {
      //   if (updates.amount) {
      //     if (updates.amount == bankLedger.debit) {
      //       bankLedger.debit = updates.amount;
      //       await bankLedger.save();
      //     } else {
      //       const { debit: previous_amount } = bankLedger;
      //       bankLedger.debit = updates.amount;
      //       bankLedger.balance =
      //         parseInt(bankLedger.previousBalance) - parseInt(updates.amount);
      //       const nextBankLedgers = await BankLedger.find({
      //         _id: { $gt: bankLedger._id },
      //       }).exec();
      //       const nextIds = nextBankLedgers.map((gl) => gl._id);
      //       if (updates.amount > previous_amount) {
      //         const difference = updates.amount - previous_amount;
      //         await updateAddNextBankLedger(nextIds, "expense", difference);
      //       } else if (updates.amount < previous_amount) {
      //         const difference = previous_amount - updates.amount;
      //         await updateSubNextBankLedger(nextIds, "expense", difference);
      //       }

      //       await bankLedger.save();
      //     }
      //     console.log("Bank Ledger A updated successfully");
      //   }
      // }
      // if (type == "income") {
      //   if (updates.amount) {
      //     if (updates.amount == bankLedger.credit) {
      //       bankLedger.credit = updates.amount;
      //       await bankLedger.save();
      //     } else {
      //       const { credit: previous_amount } = bankLedger;
      //       bankLedger.credit = updates.amount;
      //       bankLedger.balance =
      //         parseInt(bankLedger.previousBalance) + parseInt(updates.amount);
      //       const nextBankLedgers = await BankLedger.find({
      //         _id: { $gt: bankLedger._id },
      //       }).exec();
      //       const nextIds = nextBankLedgers.map((gl) => gl._id);
      //       if (updates.amount > previous_amount) {
      //         const difference = updates.amount - previous_amount;
      //         await updateAddNextBankLedger(nextIds, "income", difference);
      //       } else if (updates.amount < previous_amount) {
      //         const difference = previous_amount - updates.amount;
      //         await updateSubNextBankLedger(nextIds, "income", difference);
      //       }

      //       await bankLedger.save();
      //     }
      //     console.log("Bank Ledger A updated successfully");
      //   }
      // }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  updateSellerPurchaserBankLedger: async (
    req,
    res,
    updateId,
    updates,
    type,
    nameHeadOfAccount
  ) => {
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
        return res.status(404).json({ message: "Bank Ledger not found" });
      }
      if (type == "income") {
        if (updates.amount) {
          if (updates.amount == bankLedger.credit) {
            bankLedger.credit = updates.amount;
            await bankLedger.save();
          } else {
            const { credit: previous_amount } = bankLedger;
            bankLedger.credit = updates.amount;
            bankLedger.balance =
              parseInt(bankLedger.previousBalance) + parseInt(updates.amount);
            const nextBankLedgers = await BankLedger.find({
              _id: { $gt: bankLedger._id },
            }).exec();
            const nextIds = nextBankLedgers.map((gl) => gl._id);
            if (updates.amount > previous_amount) {
              const difference = updates.amount - previous_amount;
              await updateAddNextBankLedger(nextIds, "income", difference);
            } else if (updates.amount < previous_amount) {
              const difference = previous_amount - updates.amount;
              await updateSubNextBankLedger(nextIds, "income", difference);
            }

            await bankLedger.save();
          }
          console.log("Bank Ledger A updated successfully");
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
