const commonService = require("../../services/common/common.service");
const Voucher = require("../../models/voucher/voucher.model");
const VoucherEntry = require("../../models/voucherEntry/voucherEntry.model");
const mongoose = require("mongoose");
const { ApiError } = require("../../utils/error.util");

async function createVoucher({ voucherEntries, ...data }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  delete data.voucherNumber;
  delete data.voucherCount;

  const createdVoucher = await commonService.createDocument(Voucher, data, {
    session,
  });
  voucherEntries = voucherEntries.map((entry) => ({
    voucher: createdVoucher._id,
    account: entry.account,
    debitAmount: entry.debitAmount,
    creditAmount: entry.creditAmount,
    particulars: entry.particulars,
  }));
  const insertedVoucherEntries = await VoucherEntry.insertMany(voucherEntries, {
    session,
  });
  const voucherEntryIds = insertedVoucherEntries?.map((v) => v._id) || [];

  createdVoucher.voucherEntries = voucherEntryIds;
  await createdVoucher.save({
    session,
  });

  await session.commitTransaction();
  session.endSession();

  return { ...createdVoucher.toObject(), voucherEntries };
}

async function updateVoucher(voucherId, { voucherEntries, ...updateData }) {
  delete updateData.voucherNumber;
  delete updateData.voucherCount;

  const session = await mongoose.startSession();
  session.startTransaction();

  const updatedVoucher = await Voucher.findByIdAndUpdate(
    voucherId,
    updateData,
    { session, new: true }
  );

  if (!updatedVoucher) {
    throw new ApiError(404, "Voucher not found");
  }

  await VoucherEntry.deleteMany({ voucher: voucherId }, { session });

  voucherEntries = voucherEntries.map((entry) => ({
    voucher: updatedVoucher._id,
    account: entry.account,
    debitAmount: entry.debitAmount,
    creditAmount: entry.creditAmount,
    particulars: entry.particulars,
  }));
  const insertedVoucherEntries = await VoucherEntry.insertMany(voucherEntries, {
    session,
  });
  const voucherEntryIds = insertedVoucherEntries?.map((v) => v._id) || [];

  updatedVoucher.voucherEntries = voucherEntryIds;
  await updatedVoucher.save({
    session,
  });

  await session.commitTransaction();
  session.endSession();

  return { ...updatedVoucher.toObject(), voucherEntries };
}

async function deleteVoucher(voucherId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  const deletedVoucher = await Voucher.findByIdAndDelete(voucherId, {
    session,
  });
  if (!deletedVoucher) {
    throw new ApiError(404, "Voucher not found");
  }
  await VoucherEntry.deleteMany({ voucher: voucherId }, { session });

  await session.commitTransaction();
  session.endSession();
}

async function bulkDeleteVouchers(filters) {
  const vouchers = await Voucher.find(filters);
  const voucherIds = vouchers.map((v) => v._id);

  await Voucher.deleteMany(filters);

  await VoucherEntry.deleteMany({
    voucher: { $in: voucherIds },
  });
}

module.exports = {
  createVoucher,
  updateVoucher,
  deleteVoucher,
  bulkDeleteVouchers,
};
