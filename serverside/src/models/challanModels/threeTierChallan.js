const mongoose = require("mongoose");

const threeTierChallanSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  pName: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  branchName: {
    type: String,
    required: true,
  },
  accountNo: {
    type: Number,
    required: true,
  },
  challanNo: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  memberShipNo: {
    type: Number,
    required: true,
  },
  membershipFee: {
    type: Number,
  },
  landCost: {
    type: Number,
  },
  developmentCharges: {
    type: Number,
  },
  additionalDevelopmentCharges: {
    type: Number,
  },
  transferFee: {
    type: Number,
  },
  masjidFund: {
    type: Number,
  },
  electricityCharges: {
    type: Number,
  },
  miscellaneous: {
    type: Number,
  },
  total: {
    type: Number,
  },
  rupeesInWords: {
    type: String,
  },
});

const ThreeTierChallan = mongoose.model(
  "ThreeTierChallan",
  threeTierChallanSchema
);

module.exports = ThreeTierChallan;
