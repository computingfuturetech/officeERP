const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const vehicleDisposalCountersSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const vehicleDisposalCounters = mongoose.model(
  "vehicleDisposalCounters",
  vehicleDisposalCountersSchema
);

async function getNextVehicleDisposalId() {
  const result = await vehicleDisposalCounters.findByIdAndUpdate(
    "vehicleDisposal",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const vehicleDisposalExpenseSchema = new Schema(
  {
    vehicleDisposalId: {
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
    fuelLitre: {
      type: Number,
    },
    vehicleNumber: {
      type: Number,
    },
    vehicleType: {
      type: String,
    },
    particular: {
      type: String,
    },
    check: {
      type: String,
      default: "Cash",
    },
  },
  {
    timestamps: true,
  }
);

vehicleDisposalExpenseSchema.plugin(mongoosePaginate);

vehicleDisposalExpenseSchema.pre("save", async function (next) {
  const vehicleDisposalExpense = this;
  if (vehicleDisposalExpense.isNew) {
    vehicleDisposalExpense.vehicleDisposalId = await getNextVehicleDisposalId();
  }
  next();
});

const VehicleDisposalExpenseSchema = mongoose.model(
  "VehicleDisposalExpenseSchema",
  vehicleDisposalExpenseSchema
);
module.exports = VehicleDisposalExpenseSchema;
