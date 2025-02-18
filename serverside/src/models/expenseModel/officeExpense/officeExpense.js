const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Member = require("../../memberModels/memberList");
const mongoosePaginate = require("mongoose-paginate-v2");

const officeExpenseCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const officeExpenseCounter = mongoose.model(
  "officeExpenseCounter",
  officeExpenseCounterSchema
);

async function getNextOfficeExpenseId() {
  const result = await officeExpenseCounter.findByIdAndUpdate(
    "officeExpense",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const officeExpenseSchema = new Schema(
  {
    officeExpenseId: {
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

officeExpenseSchema.plugin(mongoosePaginate);

officeExpenseSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.officeExpenseId = await getNextOfficeExpenseId();
  }
  next();
});

officeExpenseSchema.pre("save", function (next) {
  this.mainHeadOfAccount
    ? (this.subHeadOfAccount = undefined)
    : (this.mainHeadOfAccount = undefined);
  next();
});

const OfficeExpense = mongoose.model("OfficeExpense", officeExpenseSchema);
module.exports = OfficeExpense;
