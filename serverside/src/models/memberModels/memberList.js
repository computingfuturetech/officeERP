const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const memberCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const MemberCounter = mongoose.model("MemberCounter", memberCounterSchema);

async function getNextMemberId() {
  const result = await MemberCounter.findByIdAndUpdate(
    "student",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const memberListSchema = new Schema({
  memberId: {
    type: Number,
    unique: true,
    index: true,
  },
  msNo: {
    type: String,
    unique: true,
  },
  category: {
    type: String,
  },
  area: {
    type: String,
  },
  phase: {
    type: String,
  },
  purchaseName: {
    type: String,
  },
  guardianName: {
    type: String,
  },
  address: {
    type: String,
  },
  cnicNo: {
    type: String,
  },
  plotNo: {
    type: String,
  },
  block: {
    type: String,
  },
});

memberListSchema.plugin(mongoosePaginate);

memberListSchema.pre("save", async function (next) {
  if (this.isNew && !this.memberId) {
    const nextId = await getNextMemberId();
    this.memberId = nextId;
  }
  next();
});

const MemberList = mongoose.model("MemberList", memberListSchema);

module.exports = MemberList;
