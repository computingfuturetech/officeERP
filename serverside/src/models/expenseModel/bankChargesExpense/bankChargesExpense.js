const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const bankChargesExpenseCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const bankChargesExpenseCounter = mongoose.model(
  "bankChargesExpenseCounter",
  bankChargesExpenseCounterSchema
);

async function getNextBankChargesExpenseId() {
  const result = await bankChargesExpenseCounter.findByIdAndUpdate(
    "bankChargesExpense",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const bankChargesExpenseSchema = new Schema(
  {
    bankChargesExpenseId: {
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
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankListSchema",
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
  },
  {
    timestamps: true,
  }
);

bankChargesExpenseSchema.plugin(mongoosePaginate);

bankChargesExpenseSchema.pre("save", async function (next) {
  if (!this.bankChargesExpenseId) {
    this.bankChargesExpenseId = await getNextBankChargesExpenseId();
  }
  next();
});

const BankChargesExpenseSchema = mongoose.model(
  "BankChargesExpenseSchema",
  bankChargesExpenseSchema
);
module.exports = BankChargesExpenseSchema;
