const mongoose = require("mongoose");
const {
  VOUCHER_TYPES,
  VOUCHER_STATUSES,
  VOUCHER_TYPE_ABBREVIATIONS,
} = require("../../config/constants");
const { ApiError } = require("../../utils/error.util");

const voucherSchema = new mongoose.Schema(
  {
    voucherCount: { type: Number, required: true },
    voucherNumber: { type: String, required: true, trim: true, unique: true },
    voucherType: {
      type: String,
      enum: VOUCHER_TYPES,
      required: true,
    },
    voucherDate: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: VOUCHER_STATUSES,
      default: "Pending",
    },
    voucherEntries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VoucherEntry",
      },
    ],
    description: { type: String },
    referenceNumber: { type: String },
  },
  {
    timestamps: true,
  }
);

voucherSchema.pre("validate", async function (next) {
  try {
    if (this.isNew) {
      if (!VOUCHER_TYPES.includes(this.voucherType)) {
        throw new ApiError(400, "Invalid voucher type");
      }
      const lastVoucher = await Voucher.findOne({
        voucherType: this.voucherType,
      }).sort({
        voucherCount: -1,
      });
      let count = 1;
      const voucherTypeAbbreviation =
        VOUCHER_TYPE_ABBREVIATIONS[this.voucherType];
      if (lastVoucher) {
        count = lastVoucher.voucherCount + 1;
      }
      this.voucherNumber = `${voucherTypeAbbreviation}-${count}`;
      this.voucherCount = count;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;
