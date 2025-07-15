const { VOUCHER_TYPES, VOUCHER_STATUSES } = require("../config/constants");
const { ApiError } = require("../utils/error.util");
const { respondFailure } = require("../utils/res.util");
const { isValidDate } = require("../utils/common.util");
const Voucher = require("../models/voucher/voucher.model");

function validateVoucherType(voucherType) {
  if (!voucherType) {
    throw new ApiError(400, "Voucher type is required");
  }
  if (!VOUCHER_TYPES.includes(voucherType)) {
    throw new ApiError(400, "Invalid voucher type");
  }
}

function validateVoucherAmount(amount) {
  if (amount == null) {
    throw new ApiError(400, "Voucher amount is required");
  }
  amount = Number(amount);
  if (isNaN(amount)) {
    throw new ApiError(400, "Invalid voucher amount");
  }
  if (amount === 0) {
    throw new ApiError(400, "Voucher amount cannot be zero");
  }
  if (amount < 0) {
    throw new ApiError(400, "Voucher amount cannot be negative");
  }
}

function validateVoucherDate(date) {
  if (!date) {
    throw new ApiError("Voucher date is required");
  }
  if (!isValidDate(date)) {
    throw new ApiError(400, "Invalid voucher date");
  }
}

function validateVoucherStatus(status) {
  if (!status) {
    throw new ApiError(400, "Voucher status is required");
  }
  if (!VOUCHER_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid voucher status");
  }
}

function validateVoucherEntries(voucherEntries, voucherAmount) {
  if (
    !voucherEntries ||
    !Array.isArray(voucherEntries) ||
    voucherEntries.length === 0
  ) {
    throw new ApiError(400, "Voucher entries are required");
  }

  let creditEntryCount = 0;
  let debitEntryCount = 0;
  let totalDebitAmount = 0;
  let totalCreditAmount = 0;
  
  for (const entry of voucherEntries) {
    entry.creditAmount = Number(entry.creditAmount) || 0;
    entry.debitAmount = Number(entry.debitAmount) || 0;

    if (entry.creditAmount < 0) {
      throw new ApiError(
        400,
        "In voucher entry credit amount cannot be negative"
      );
    }
    if (entry.debitAmount < 0) {
      throw new ApiError(
        400,
        "In voucher entry debit amount cannot be negative"
      );
    }

    if (!entry.account) {
      throw new ApiError(400, "Voucher entry must have an account");
    }

    if (entry.creditAmount === 0 && entry.debitAmount === 0) {
      throw new ApiError(
        400,
        "Voucher entry must have either credit or debit amount"
      );
    }
    if (entry.creditAmount > 0 && entry.debitAmount > 0) {
      throw new ApiError(
        400,
        "Voucher entry cannot have both debit and credit amounts"
      );
    }
    if (entry.creditAmount > 0) {
      totalCreditAmount += entry.creditAmount;
      creditEntryCount++;
    }
    if (entry.debitAmount > 0) {
      totalDebitAmount += entry.debitAmount;
      debitEntryCount++;
    }
  }

  if (creditEntryCount === 0 || debitEntryCount === 0) {
    throw new ApiError(400, "Voucher must have at least one debit and one credit entry");
  }

  if (totalDebitAmount !== totalCreditAmount) {
    throw new ApiError(
      400,
      "Voucher is unbalanced: total debit must equal total credit"
    );
  }

  if (voucherAmount !== totalDebitAmount) {
    throw new ApiError(
      400,
      `Voucher amount is invalid: It should be ${totalDebitAmount}`
    );
  }
}

async function validateVoucherOnCreate(req, res, next) {
  try {
    const { voucherEntries, ...data } = req.body || {};

    validateVoucherType(data.voucherType);

    validateVoucherAmount(data.amount);

    validateVoucherDate(data.voucherDate);

    validateVoucherStatus(data.status);

    validateVoucherEntries(voucherEntries, Number(data.amount));

    next();
  } catch (error) {
    respondFailure(res, error);
  }
}

async function validateVoucherOnUpdate(req, res, next) {
  try {
    const { voucherEntries, ...data } = req.body || {};
    const voucherId = req.params.id;

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      throw new ApiError(404, "Voucher not found");
    }

    if (data.voucherType) {
      validateVoucherType(data.voucherType);
    }

    if (data.amount) {
      validateVoucherAmount(data.amount);
    }

    if (data.voucherDate) {
      validateVoucherDate(data.voucherDate);
    }

    if (data.status) {
      validateVoucherStatus(data.status);
    }

    if (voucherEntries) {
      validateVoucherEntries(voucherEntries, Number(data.amount) || voucher.amount);
    }

    next();
  } catch (error) {
    respondFailure(res, error);
  }
}

module.exports = {
  validateVoucherOnCreate,
  validateVoucherOnUpdate,
};
