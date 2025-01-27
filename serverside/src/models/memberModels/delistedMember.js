const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const delistedMemberCounterSchema = new Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const DelistedMemberCounter = mongoose.model(
  "DelistedMemberCounter",
  delistedMemberCounterSchema
);

async function getNextDelistedMemberId() {
  const result = await DelistedMemberCounter.findByIdAndUpdate(
    "student",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const delistedMemberListSchema = new Schema({
  memberId: {
    type: Number,
    unique: true,
    index: true,
  },
  msNo: {
    type: String,
  },
  area: {
    type: Number,
  },
  phase: {
    type: String,
  },
  purchaseName: {
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
  delistedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "Delisted",
  },
});

delistedMemberListSchema.plugin(mongoosePaginate);

delistedMemberListSchema.pre("save", async function (next) {
  if (this.isNew && !this.memberId) {
    this.memberId = await getNextDelistedMemberId();
  }
  next();
});

const DelistedMemberList = mongoose.model(
  "DelistedMemberList",
  delistedMemberListSchema
);

module.exports = DelistedMemberList;
