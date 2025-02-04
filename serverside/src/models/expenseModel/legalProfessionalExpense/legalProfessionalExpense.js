const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const legalProfessionalExpenseCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const legalProfessionalExpenseCounter = mongoose.model(
  "legalProfessionalExpenseCounter",
  legalProfessionalExpenseCounterSchema
);

async function getNextLegalProfessionalExpenseId() {
  const result = await legalProfessionalExpenseCounter.findByIdAndUpdate(
    "legalProfessionalExpense",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const legalProfessionalExpenseSchema = new Schema(
  {
    legalProfessionalExpenseId: {
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
    particular: {
      type: String,
    },
    vendor: {
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

legalProfessionalExpenseSchema.plugin(mongoosePaginate);

legalProfessionalExpenseSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }
  try {
    this.legalProfessionalExpenseId = await getNextLegalProfessionalExpenseId();
    next();
  } catch (error) {
    return next(error);
  }
});

const LegalProfessionalExpense = mongoose.model(
  "LegalProfessionalExpense",
  legalProfessionalExpenseSchema
);
module.exports = LegalProfessionalExpense;
