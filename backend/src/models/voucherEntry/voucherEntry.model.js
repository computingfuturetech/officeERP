const mongoose = require("mongoose");

const voucherEntrySchema = new mongoose.Schema(
  {
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChartOfAccounts",
      required: true,
    },
    debitAmount: { type: Number, required: true, min: 0 },
    creditAmount: { type: Number, required: true, min: 0 },
    particulars: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const VoucherEntry = mongoose.model("VoucherEntry", voucherEntrySchema);
module.exports = VoucherEntry;
