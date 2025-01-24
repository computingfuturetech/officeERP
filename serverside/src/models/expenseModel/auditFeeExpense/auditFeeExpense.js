const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auditFeeExpenseSchema = new Schema(
  {
    paidDate: {
      type: Date,
    },
    mainHeadOfAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainExpenseHeadOfAccount",
    },
    subHeadOfAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubExpenseHeadOfAccount",
    },
    amount: {
      type: Number,
    },
    year: {
      type: Number,
    },
    particular: {
      type: String,
    },
    chequeNumber: {
      type: Number,
    },
    challanNo: {
      type: Number,
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankListSchema",
    },
    check: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const AuditFeeExpenseSchema = mongoose.model(
  "AuditFeeExpenseSchema",
  auditFeeExpenseSchema
);
module.exports = AuditFeeExpenseSchema;
