const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const bankProfitCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const BankProfitCounter = mongoose.model(
  "BankProfitCounter",
  bankProfitCounterSchema
);

async function getNextBankProfitId() {
  const result = await BankProfitCounter.findByIdAndUpdate(
    "bankProfit",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const bankProfitSchema = new Schema(
  {
    bankProfitId: {
      type: Number,
      unique: true,
      index: true,
    },
    paidDate: {
      type: Date,
    },
    headOfAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IncomeHeadOfAccount",
    },
    amount: {
      type: Number,
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankListSchema",
    },
    profitMonth: {
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

bankProfitSchema.plugin(mongoosePaginate);

bankProfitSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.bankProfitId = await getNextBankProfitId();
  }
  next();
});

const BankProfitSchema = mongoose.model("BankProfitSchema", bankProfitSchema);

module.exports = BankProfitSchema;
