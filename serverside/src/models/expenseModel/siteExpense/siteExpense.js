const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const siteExpenseCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const siteExpenseCounter = mongoose.model(
  "siteExpenseCounter",
  siteExpenseCounterSchema
);

async function getNextSiteExpenseId() {
  const result = await siteExpenseCounter.findByIdAndUpdate(
    "siteExpense",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const siteExpenseSchema = new Schema(
  {
    siteExpenseId: {
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

siteExpenseSchema.plugin(mongoosePaginate);

siteExpenseSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.siteExpenseId = await getNextSiteExpenseId();
  }
  next();
});

const SiteExpense = mongoose.model("SiteExpense", siteExpenseSchema);
module.exports = SiteExpense;
