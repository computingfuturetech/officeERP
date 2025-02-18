const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const electricityWaterExpenseCountersSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const electricityWaterExpenseCounters = mongoose.model(
  "electricityWaterExpenseCounters",
  electricityWaterExpenseCountersSchema
);

async function getNextElectricityWaterExpenseId() {
  const result = await electricityWaterExpenseCounters.findByIdAndUpdate(
    "electricityWaterExpense",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const electricityWaterExpenseSchema = new Schema(
  {
    electricityWaterExpenseId: {
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

electricityWaterExpenseSchema.plugin(mongoosePaginate);

electricityWaterExpenseSchema.pre("save", async function (next) {
  if (!this.electricityWaterExpenseId) {
    this.electricityWaterExpenseId = await getNextElectricityWaterExpenseId();
  }
  next();
});

const ElectricityWaterExpenseSchema = mongoose.model(
  "ElectricityWaterExpenseSchema",
  electricityWaterExpenseSchema
);
module.exports = ElectricityWaterExpenseSchema;
