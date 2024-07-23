const mongoose = require("mongoose");

const singleTierChallanSchema = new mongoose.Schema({
  date: {
    type: String,
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
  possessionFee: {
    type: Number,
  },
  waterConnectionCharges: {
    type: Number,
  },
  electricityConnectionFee: {
    type: Number,
  },
  construction: {
    type: Number,
  },
  masjidFund: {
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

const SingleTierChallan = mongoose.model(
  "SingleTierChallan",
  singleTierChallanSchema
);

module.exports = SingleTierChallan;
