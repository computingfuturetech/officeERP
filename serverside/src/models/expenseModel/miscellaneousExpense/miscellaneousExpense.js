const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const miscellaneousExpenseCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const miscellaneousExpenseCounter = mongoose.model(
  "miscellaneousExpenseCounter",
  miscellaneousExpenseCounterSchema
);

async function getNextMiscellaneousExpenseId() {
  const result = await miscellaneousExpenseCounter.findByIdAndUpdate(
    "miscellaneousExpense",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const miscellaneousExpenseSchema = new Schema(
  {
    miscellaneousExpenseId: {
      type: Number,
      unique: true,
      index: true,
    },
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
    description: {
      type: String,
    },
    plotNumber: {
      type: String,
    },
    vendor: {
      type: String,
    },
    chequeNumber: {
      type: String,
    },
    challanNo: {
      type: String,
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

miscellaneousExpenseSchema.plugin(mongoosePaginate);

miscellaneousExpenseSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.miscellaneousExpenseId = await getNextMiscellaneousExpenseId();
  }
  next();
});

const MiscellaneousExpenseSchema = mongoose.model(
  "MiscellaneousExpenseSchema",
  miscellaneousExpenseSchema
);
module.exports = MiscellaneousExpenseSchema;
