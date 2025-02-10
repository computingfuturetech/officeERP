const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const bankCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const BankCounter = mongoose.model("BankCounter", bankCounterSchema);

async function getNextBankId() {
  const result = await BankCounter.findByIdAndUpdate(
    "bank",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const bankListSchema = new Schema(
  {
    bankId: {
      type: Number,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    bankName: {
      type: String,
    },
    branchName: {
      type: String,
    },
    accountNo: {
      type: String,
      unique: true,
    },
    branchCode: {
      type: String,
    },
    accountName: {
      type: String,
    },
    accountType: {
      type: String,
    },
    bankBalance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankBalanceSchema",
    },
  },
  {
    timestamps: true,
  }
);

bankListSchema.plugin(mongoosePaginate);

bankListSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.bankId = await getNextBankId();
  }
  next();
});

const BankListSchema = mongoose.model("BankListSchema", bankListSchema);
module.exports = BankListSchema;
