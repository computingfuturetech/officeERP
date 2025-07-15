const mongoose = require("mongoose");
const { ACCOUNT_TYPES } = require("../../config/constants");
const { ApiError } = require("../../utils/error.util");

const chartOfAccountsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    count: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ACCOUNT_TYPES,
    },
    parent: {
      type: mongoose.Types.ObjectId,
      ref: "ChartOfAccounts",
    },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

async function getCount(parent = null) {
  const account = await ChartOfAccounts.findOne({
    parent
  }).sort({ count: -1 });
  if (!account) return 1;
  return account.count + 1;
}

async function getCodeAndCount(parent = null) {
  const account = await ChartOfAccounts.findById(parent);
  const preCount = account ? `${account.code}.` : "";
  const count = await getCount(parent);
  const code = `${preCount}${count}`;
  return { code, count };
}

chartOfAccountsSchema.pre("validate", async function (next) {
  try {
    if (this.isNew) {
      if (this.parent != null) {
        const parentAccount = await ChartOfAccounts.findById(this.parent);
        if (!parentAccount) throw new ApiError(404, "Parent account not found");
      }
      const { code, count } = await getCodeAndCount(this.parent);
      this.code = code;
      this.count = count;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const ChartOfAccounts = mongoose.model("ChartOfAccounts", chartOfAccountsSchema);
module.exports = ChartOfAccounts;
