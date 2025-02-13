const CashBookLedger = require("../models/ledgerModels/cashBookLedger");
const GeneralLedger = require("../models/ledgerModels/generalLedger");
const FixedAmount = require("../models/fixedAmountModel/fixedAmount");
const CheckMainAndSubHeadOfAccount = require("../middleware/checkMainAndSubHeadOfAccount");
const IncomeHeadOfAccount = require("../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const MainExpenseHeadOfAccount = require("../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const SubExpenseHeadOfAccount = require("../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");

async function updateAddNextCashLedger(nextIds, type, difference) {
  try {
    if (type == "expense") {
      for (const id of nextIds) {
        const temp = await CashBookLedger.findOne({ _id: id }).exec();
        temp.balance = parseInt(temp.balance) - difference;
        temp.previousBalance = parseInt(temp.previousBalance) - difference;
        await temp.save();
      }
      console.log("Expense Cash Ledgers updated successfully");
    } else if (type == "income") {
      for (const id of nextIds) {
        const temp = await CashBookLedger.findOne({ _id: id }).exec();
        temp.balance = parseInt(temp.balance) + difference;
        temp.previousBalance = parseInt(temp.previousBalance) + difference;
        await temp.save();
      }
      console.log("Income Cash Ledgers updated successfully");
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateSubNextCashLedger(nextIds, type, difference) {
  try {
    if (type == "expense") {
      for (const id of nextIds) {
        const temp = await CashBookLedger.findOne({ _id: id }).exec();
        temp.balance = parseInt(temp.balance) + difference;
        temp.previousBalance = parseInt(temp.previousBalance) + difference;
        await temp.save();
      }
      console.log("Expense Cash Ledgers updated successfully");
    } else if (type == "income") {
      for (const id of nextIds) {
        const temp = await CashBookLedger.findOne({ _id: id }).exec();
        temp.balance = parseInt(temp.balance) - difference;
        temp.previousBalance = parseInt(temp.previousBalance) - difference;
        await temp.save();
      }
      console.log("Income Cash Ledgers updated successfully");
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateNextCashBookLedgers(nextIds, previousBalance) {
  try {
    for (const id of nextIds) {
      const cashBookLedger = await CashBookLedger.findOne({ _id: id }).exec();
      const type = cashBookLedger.credit === undefined ? "debit" : "credit";
      if (type === "credit") {
        cashBookLedger.previousBalance = previousBalance;
        cashBookLedger.balance = previousBalance + cashBookLedger.credit;
      } else {
        cashBookLedger.previousBalance = previousBalance;
        cashBookLedger.balance = previousBalance - cashBookLedger.debit;
      }
      await cashBookLedger.save();
      previousBalance = cashBookLedger.balance;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createCashBookLedger: async (
    req,
    res,
    voucherNo,
    type,
    headOfAccount,
    particular,
    amount,
    date,
    update_id
  ) => {
    try {
      let balance;

      let latestBalance = await CashBookLedger.findOne({
        balance: { $exists: true },
        date: {
          $lte: new Date(date),
        },
      })
        .sort({ date: -1, createdAt: -1 })
        .exec();

      if (latestBalance) {
        balance = latestBalance.balance;
      } else {
        latestBalance = await FixedAmount.findOne({})
          .sort({ cashOpeningBalance: -1 })
          .exec();
        balance = latestBalance.cashOpeningBalance;
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

      const cashLedger = new CashBookLedger({
        date: date,
        voucherNo: voucherNo,
        type: type,
        headOfAccount: headOfAccount,
        particular: particular,
        ...(type === "expense" ? { debit: amount } : { credit: amount }),
        ...(type === "expense"
          ? {
              ...(main_head_id
                ? { mainHeadOfAccount: main_head_id }
                : { subHeadOfAccount: sub_head_id }),
            }
          : {
              incomeHeadOfAccount: incomeHOF._id,
            }),
        balance: newBalance,
        updateId: update_id,
        previousBalance: balance,
      });
      const savedCashBookLedger = await cashLedger.save();
      console.log("Cash Ledger created successfully");

      const nextCashBookLedgers = await CashBookLedger.find({
        _id: { $ne: savedCashBookLedger._id },
        date: {
          $gt: new Date(date),
        },
      })
        .sort({ date: 1 })
        .exec();

      let nextIds = nextCashBookLedgers.map((gl) => gl._id);

      updateNextCashBookLedgers(nextIds, savedCashBookLedger.balance);

    } catch (err) {
      return res.status(500).json({ message: err });
    }
  },
  updateCashLedger: async (req, res, updateId, updates, type) => {
    try {

      const updateFields = { ...updates };
      delete updateFields.amount;
      const cashBookLedger = await CashBookLedger.findOne({ updateId: updateId });

      if (!cashBookLedger) {
        return res.status(404).json({ message: "Cash Book Ledger not found" });
      }

      if (type === "income") {
        cashBookLedger.credit = updates.amount;
        cashBookLedger.balance = cashBookLedger.previousBalance + Number(updates.amount);
      }

      else if (type === "expense") {
        cashBookLedger.debit = updates.amount;
        cashBookLedger.balance = cashBookLedger.previousBalance - Number(updates.amount);
      }

      for (const key of Object.keys(updateFields)) {
        cashBookLedger[key] = updateFields[key];
      }

      const savedCashBookLedger = await cashBookLedger.save();

      const nextcashBookLedgers = await CashBookLedger.find({
        _id: { $ne: savedCashBookLedger._id },
        date: {
          $gte: savedCashBookLedger.date,
        },
        createdAt: { $gt: savedCashBookLedger.createdAt }
      })
        .sort({ date: 1 })
        .exec();

      let nextIds = nextcashBookLedgers.map((gl) => gl._id);

      nextIds = nextIds.filter(
        (gl) => cashBookLedger._id.toString() !== gl._id.toString()
      );

      updateNextCashBookLedgers(nextIds, cashBookLedger.balance);

      // const updateFields = { ...updates };
      // delete updateFields.amount;
      // const cashLedger = await CashBookLedger.findOneAndUpdate(
      //   { updateId: updateId },
      //   { $set: updateFields },
      //   { new: true }
      // ).exec();
      // if (!cashLedger) {
      //   return res.status(404).json({ message: "Cash Ledger not found" });
      // }
      // if (type == "expense") {
      //   if (updates.amount) {
      //     if (updates.amount == cashLedger.debit) {
      //       cashLedger.debit = updates.amount;
      //       await cashLedger.save();
      //     } else {
      //       const { debit: previous_amount } = cashLedger;
      //       cashLedger.debit = updates.amount;
      //       cashLedger.balance =
      //         parseInt(cashLedger.previousBalance) - parseInt(updates.amount);
      //       const nextCashLedgers = await CashBookLedger.find({
      //         _id: { $gt: cashLedger._id },
      //       }).exec();
      //       const nextIds = nextCashLedgers.map((gl) => gl._id);
      //       if (updates.amount > previous_amount) {
      //         const difference = updates.amount - previous_amount;
      //         await updateAddNextCashLedger(nextIds, "expense", difference);
      //       } else if (updates.amount < previous_amount) {
      //         const difference = previous_amount - updates.amount;
      //         await updateSubNextCashLedger(nextIds, "expense", difference);
      //       }

      //       await cashLedger.save();
      //     }
      //     console.log("Cash Ledger A updated successfully");
      //   }
      // } else if (type == "income") {
      //   if (updates.amount) {
      //     if (updates.amount == cashLedger.credit) {
      //       cashLedger.credit = updates.amount;
      //       await cashLedger.save();
      //     } else {
      //       const { credit: previous_amount } = cashLedger;
      //       cashLedger.credit = updates.amount;
      //       cashLedger.balance =
      //         parseInt(cashLedger.previousBalance) + parseInt(updates.amount);
      //       const nextCashLedgers = await CashBookLedger.find({
      //         _id: { $gt: cashLedger._id },
      //       }).exec();
      //       const nextIds = nextCashLedgers.map((gl) => gl._id);
      //       if (updates.amount > previous_amount) {
      //         const difference = updates.amount - previous_amount;
      //         await updateAddNextCashLedger(nextIds, "income", difference);
      //       } else if (updates.amount < previous_amount) {
      //         const difference = previous_amount - updates.amount;
      //         await updateSubNextCashLedger(nextIds, "income", difference);
      //       }

      //       await cashLedger.save();
      //     }
      //     console.log("Cash Ledger updated successfully");
      //   }
      // }

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  updateSellerPurchaserCashLedger: async (
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
      const cashLedger = await CashBookLedger.findOneAndUpdate(
        { updateId: updateId, headOfAccount: nameHeadOfAccount },
        { $set: updateFields },
        { new: true }
      ).exec();
      if (!cashLedger) {
        return res.status(404).json({ message: "Cash Ledger not found" });
      }
      if (type == "income") {
        if (updates.amount) {
          if (updates.amount == cashLedger.credit) {
            cashLedger.credit = updates.amount;
            await cashLedger.save();
          } else {
            const { credit: previous_amount } = cashLedger;
            cashLedger.credit = updates.amount;
            cashLedger.balance =
              parseInt(cashLedger.previousBalance) + parseInt(updates.amount);
            const nextCashLedgers = await CashBookLedger.find({
              _id: { $gt: cashLedger._id },
            }).exec();
            const nextIds = nextCashLedgers.map((gl) => gl._id);
            if (updates.amount > previous_amount) {
              const difference = updates.amount - previous_amount;
              await updateAddNextCashLedger(nextIds, "income", difference);
            } else if (updates.amount < previous_amount) {
              const difference = previous_amount - updates.amount;
              await updateSubNextCashLedger(nextIds, "income", difference);
            }

            await cashLedger.save();
          }
          console.log("Cash Ledger updated successfully");
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
