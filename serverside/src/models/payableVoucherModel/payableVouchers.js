const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const payableVoucherSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  headOfAccount: {
    type: String,
    trim: true,
  },
  accountNumber: {
    type: Number,
  },
  particular: {
    type: String,
    trim: true,
  },
  chequeNo: {
    type: String,
  },
  challanNo: {
    type: String,
  },
  voucherNo: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  type: {
    type: String,
    enum: ["cash", "bank"],
    default: "bank",
  },
});

const PayableVouchers = mongoose.model("PayableVouchers", payableVoucherSchema);

module.exports = PayableVouchers;
