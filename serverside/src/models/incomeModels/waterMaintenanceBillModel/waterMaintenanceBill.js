const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Member = require("../../memberModels/memberList");
const mongoosePaginate = require("mongoose-paginate-v2");

const waterMaintenaceBillCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const WaterMaintenaceBillCounter = mongoose.model(
  "WaterMaintenaceBillCounter",
  waterMaintenaceBillCounterSchema
);

async function getNextWaterMaintenaceBillId() {
  const result = await WaterMaintenaceBillCounter.findByIdAndUpdate(
    "waterMaintenaceBill",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const waterMaintenaceBillSchema = new Schema(
  {
    waterMaintenaceBillId: {
      type: Number,
      unique: true,
      index: true,
    },
    msNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemberList",
      required: true,
    },
    plotNo: {
      type: String,
    },
    referenceNo: {
      type: Number,
    },
    billingMonth: {
      type: String,
    },
    paidDate: {
      type: Date,
    },
    amount: {
      type: Number,
    },
    incomeHeadOfAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IncomeHeadOfAccount",
    },
    challanNo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

waterMaintenaceBillSchema.plugin(mongoosePaginate);

waterMaintenaceBillSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.waterMaintenaceBillId = await getNextWaterMaintenaceBillId();
  }
  next();
});

const WaterMaintenaceBillSchema = mongoose.model(
  "WaterMaintenaceBillSchema",
  waterMaintenaceBillSchema
);
module.exports = WaterMaintenaceBillSchema;
