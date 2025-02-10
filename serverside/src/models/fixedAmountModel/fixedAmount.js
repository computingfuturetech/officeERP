const mongoose = require("mongoose");
const schema = mongoose.Schema;

const fixedAmountSchema = new schema(
  {
    shareCapital: {
      type: Number,
    },
    bankOpeningBalance: {
      type: Number,
    },
    cashOpeningBalance: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const FixedAmount = mongoose.model("FixedAmount", fixedAmountSchema);

module.exports = FixedAmount;
