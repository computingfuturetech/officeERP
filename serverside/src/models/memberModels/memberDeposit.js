const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const memberDepositSchema = new Schema({
  msNo: {
    type: String,
  },
  date: {
    type: Date,
  },
  challanNo: {
    type: String,
  },
  type: {
    type: String,
    enum: ["cash", "bank"],
    default: "bank",
  },
  amount: {
    type: Number,
  },
});

memberDepositSchema.plugin(mongoosePaginate);
const MemberDeposit = mongoose.model("MemberDeposit", memberDepositSchema);

module.exports = MemberDeposit;
