const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const officeUtilExpenseCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const OfficeUtilExpenseCounter = mongoose.model(
  "OfficeUtilExpenseCounter",
  officeUtilExpenseCounterSchema
);

async function getNextOfficeUtilExpenseId() {
  const result = await OfficeUtilExpenseCounter.findByIdAndUpdate(
    "officeUtilExpense",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const officeUtilExpenseSchema = new Schema(
  {
    officeUtilId: {
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
    billingMonth: {
      type: String,
    },
    amount: {
      type: Number,
    },
    billReference: {
      type: Number,
    },
    advTax: {
      type: Number,
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

officeUtilExpenseSchema.plugin(mongoosePaginate);

officeUtilExpenseSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.officeUtilId = await getNextOfficeUtilExpenseId();
  }
  next();
});

const OfficeUtilExpense = mongoose.model(
  "OfficeUtilExpense",
  officeUtilExpenseSchema
);
module.exports = OfficeUtilExpense;
