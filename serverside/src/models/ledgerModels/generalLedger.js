const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const generalLedgerSchema = new Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    headOfAccount: {
      type: String,
    },
    mainHeadOfAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainExpenseHeadOfAccount",
    },
    subHeadOfAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubExpenseHeadOfAccount",
    },
    incomeHeadOfAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IncomeHeadOfAccount",
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankListSchema",
    },
    particular: {
      type: String,
    },
    chequeNo: {
      type: String,
    },
    challanNo: {
      type: String,
    },
    voucherNo: {
      type: String,
    },
    credit: {
      type: Number,
    },
    debit: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    type: {
      type: String,
    },
    balance: {
      type: Number,
    },
    updateId: {
      type: String,
    },
    previousBalance: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const GeneralLedger = mongoose.model("GeneralLedger", generalLedgerSchema);

module.exports = GeneralLedger;
