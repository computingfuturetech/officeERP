const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const operatingFixedAssetsSchema = new Schema({
  building: {
    type: Number,
  },
  waterTank: {
    type: Number,
  },
  tubeWell: {
    type: Number,
  },
  furnitureAndFixture: {
    type: Number,
  },
  officeEquipment: {
    type: Number,
  },
  computerEquipment: {
    type: Number,
  },
  armsAndAmmuntion: {
    type: Number,
  },
  vehicles: {
    type: Number,
  },
  tractorAndTrolly: {
    type: Number,
  },
  transformer: {
    type: Number,
  },
  machinery: {
    type: Number,
  },
  bankName: {
    type: Number,
  },
});

const OperatingFixedAssets = mongoose.model(
  "OperatingFixedAssets",
  operatingFixedAssetsSchema
);

module.exports = OperatingFixedAssets;
