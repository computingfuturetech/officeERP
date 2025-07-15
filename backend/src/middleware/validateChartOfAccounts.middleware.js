const { respondFailure } = require("../utils/res.util");
const ChartOfAccounts = require("../models/chartOfAccounts/chartOfAccounts.model");
const { ApiError } = require("../utils/error.util");
const { ACCOUNT_TYPES } = require("../config/constants");
const mongoose = require("mongoose");

async function validateAccountParentType(currentAccounttype, parentId) {
  const parentAccount = await ChartOfAccounts.findById(parentId);
  if (!parentAccount) throw new ApiError(400, "Parent account not found");
  if (parentAccount.type !== currentAccounttype)
    throw new ApiError(400, "Parent account must be of same type");
}

async function validateAccountOnCreate(req, res, next) {
  try {
    const data = req.body;

    // validate name
    if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
      throw new ApiError(400, "Name is required");
    }
    const existingAccount = await ChartOfAccounts.findOne({ name: data.name });
    if (existingAccount)
      throw new ApiError(
        400,
        `Account with name "${data.name.trim()}" already exists`
      );

    // validate type
    if (!ACCOUNT_TYPES.includes(data.type)) {
      throw new ApiError(400, "Invalid account type");
    }

    // validate parent account
    if (data.parent) {
      if (!mongoose.Types.ObjectId.isValid(data.parent)) {
        throw new ApiError(400, "Invalid parent account id");
      }
      await validateAccountParentType(data.type, data.parent);
    }
    next();
  } catch (error) {
    respondFailure(res, error);
  }
}

async function validateAccountOnUpdate(req, res, next) {
  try {
    const updateData = req.body;
    const id = req.params.id;

    const account = await ChartOfAccounts.findById(id);
    if (!account) throw new ApiError(404, "Account not found");

    const type = updateData.type || account.type;
    const parent = updateData.parent || account.parent;

    // validate name
    if (updateData.name !== undefined) {
      if (
        !updateData.name ||
        typeof updateData.name !== "string" ||
        !updateData.name.trim()
      ) {
        throw new ApiError(400, "Name is required");
      }
      const existingAccount = await ChartOfAccounts.findOne({
        name: updateData.name,
        _id: { $ne: id },
      });
      if (existingAccount)
        throw new ApiError(
          400,
          `Account with name "${updateData.name.trim()}" already exists`
        );
    }

    // validate type
    if (!ACCOUNT_TYPES.includes(type)) {
      throw new ApiError(400, "Invalid account type");
    }

    // validate parent account
    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        throw new ApiError(400, "Invalid parent account id");
      }
      await validateAccountParentType(type, parent);
    }
    next();
  } catch (error) {
    respondFailure(res, error);
  }
}

module.exports = {
  validateAccountOnCreate,
  validateAccountOnUpdate,
};
