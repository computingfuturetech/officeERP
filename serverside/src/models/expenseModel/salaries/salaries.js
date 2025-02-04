const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const salaryCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const salaryCounter = mongoose.model("salaryCounter", salaryCounterSchema);

async function getNextSalaryId() {
  const result = await salaryCounter.findByIdAndUpdate(
    "salary",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const salariesSchema = new Schema(
  {
    salaryId: {
      type: Number,
      unique: true,
      index: true,
    },
    // salaryType: {
    //   type: mongoose.Schema.Types.ObjectId,
    // //   ref: "SalaryTypeSchema",
    //   required: true,
    // },
    salaryType: {
      type: String,
      enum: {
        values: ["office", "site"],
      },
    },
    mainHeadOfAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MainExpenseHeadOfAccount",
    },
    subHeadOfAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubExpenseHeadOfAccount",
    },
    employeeName: {
      type: String,
    },
    amount: {
      type: Number,
    },
    paidDate: {
      type: Date,
    },
    chequeNumber: {
      type: Number,
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankListSchema",
    },
    particular: {
      type: String,
    },
    challanNo: {
      type: Number,
    },
    check: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

salariesSchema.plugin(mongoosePaginate);

salariesSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.salaryId = await getNextSalaryId();
  }
  next();
});

const SalariesSchema = mongoose.model("SalariesSchema", salariesSchema);
module.exports = SalariesSchema;
