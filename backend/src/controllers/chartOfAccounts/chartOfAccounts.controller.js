const ChartOfAccounts = require("../../models/chartOfAccounts/chartOfAccounts.model");
const { respondSuccess, respondFailure } = require("../../utils/res.util");
const chartOfAccountsService = require("../../services/chartOfAccounts/chartOfAccounts.service");
const commonService = require("../../services/common/common.service");
const { ApiError } = require("../../utils/error.util");

async function createAccount(req, res) {
  try {
    const createdAccount =
      await chartOfAccountsService.createAccount(req.body);
    respondSuccess(
      res,
      201,
      "Account created successfully",
      createdAccount
    );
  } catch (error) {
    respondFailure(res, error);
  }
}

async function getAccounts(req, res) {
  try {
    const { page, limit, pagination, type } = req.query;
    const filters = {};
    const options = {};
    let data, meta;

    if (type) {
      filters.type = type;
    }

    options.sort = { code: 1 };

    if (pagination === "false") {
      data = await commonService.getAllDocuments(
        ChartOfAccounts,
        filters,
        options
      );
    } else {
      options.page = page;
      options.limit = limit;
      const result = await commonService.getDocuments(
        ChartOfAccounts,
        filters,
        options
      );
      data = result.data;
      meta = result.meta;
    }

    respondSuccess(
      res,
      200,
      "Accounts retrieved successfully",
      data,
      meta
    );
  } catch (error) {
    respondFailure(res, error);
  }
}

async function getAccountById(req, res) {
  try {
    const account = await commonService.getDocumentById(
      ChartOfAccounts,
      req.params.id
    );
    if (!account) throw new ApiError(404, "Account not found");
    respondSuccess(
      res,
      200,
      "Account retrieved successfully",
      account
    );
  } catch (error) {
    respondFailure(res, error);
  }
}

async function updateAccount(req, res) {
  try {
    const updatedAccount =
      await chartOfAccountsService.updateAccount(req.params.id, req.body);
    respondSuccess(
      res,
      200,
      "Account updated successfully",
      updatedAccount
    );
  } catch (error) {
    respondFailure(res, error);
  }
}

async function deleteAccount(req, res) {
  try {
    await chartOfAccountsService.deleteAccount(req.params.id);
    respondSuccess(res, 200, "Account deleted successfully");
  } catch (error) {
    respondFailure(res, error);
  }
}

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};
