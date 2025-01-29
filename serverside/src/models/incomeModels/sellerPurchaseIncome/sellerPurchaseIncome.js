const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Member = require("../../memberModels/memberList");
const HeadOfAccount = require("../../headOfAccountModel/headOfAccount");
const checkRole = require("../../../middleware/checkRole");
const mongoosePaginate = require("mongoose-paginate-v2");

const sellerPurchaserCounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const sellerPurchaserCounter = mongoose.model(
  "sellerPurchaserCounter",
  sellerPurchaserCounterSchema
);

async function getNextSellerPurchaserId() {
  const result = await sellerPurchaserCounter.findByIdAndUpdate(
    "sellerPurchaser",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
}

const sellerPurchaseIncomeSchema = new Schema(
  {
    sellerPurchaserId: {
      type: Number,
      unique: true,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    msNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemberList",
      required: true,
    },
    challanNo: {
      type: Number,
    },
    address: {
      type: String,
    },
    type: {
      type: String,
    },
    paymentDetail: {
      type: Map,
      of: Number,
    },
    particular: {
      type: String,
    },
    chequeNumber: {
      type: Number,
    },
    // bankAccount: {
    //   type: Number,
    // },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankListSchema",
    },
    check: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

sellerPurchaseIncomeSchema.plugin(mongoosePaginate);

sellerPurchaseIncomeSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.sellerPurchaserId = await getNextSellerPurchaserId();
  }
  next();
});

const SellerPurchaseIncomeSchema = mongoose.model(
  "SellerPurchaseIncomeSchema",
  sellerPurchaseIncomeSchema
);
module.exports = SellerPurchaseIncomeSchema;
