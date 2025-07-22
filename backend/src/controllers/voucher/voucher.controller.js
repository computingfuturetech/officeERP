const { respondFailure, respondSuccess } = require("../../utils/res.util");
const commonService = require("../../services/common/common.service");
const Voucher = require("../../models/voucher/voucher.model");
const voucherService = require("../../services/voucher/voucher.service");

async function createVoucher(req, res) {
  try {
    const createdVoucher = await voucherService.createVoucher(req.body);
    respondSuccess(res, 201, "Voucher created successfully", createdVoucher);
  } catch (error) {
    respondFailure(res, error);
  }
}

async function getVouchers(req, res) {
  try {
    const { page, limit, pagination, voucherType } = req.query;
    const filters = {};
    const options = {};
    let data, meta;

    if (voucherType) {
      const voucherTypes = voucherType.split(",");
      filters.voucherType = {
        $in: voucherTypes,
      };
    }

    options.populate = "voucherEntries";

    if (pagination === "false") {
      data = await commonService.getAllDocuments(Voucher, filters);
    } else {
      options.page = page;
      options.limit = limit;
      const result = await commonService.getDocuments(
        Voucher,
        filters,
        options
      );
      data = result.data;
      meta = result.meta;
    }
    respondSuccess(res, 200, "Vouchers retrieved successfully", data, meta);
  } catch (error) {
    respondFailure(res, error);
  }
}

async function updateVoucher(req, res) {
  try {
    const voucherId = req.params.id;
    const updatedVoucher = await voucherService.updateVoucher(
      voucherId,
      req.body
    );
    respondSuccess(res, 200, "Voucher updated successfully", updatedVoucher);
  } catch (error) {
    respondFailure(res, error);
  }
}

async function deleteVoucher(req, res) {
  try {
    const voucherId = req.params.id;
    await voucherService.deleteVoucher(voucherId);
    respondSuccess(res, 200, "Voucher deleted successfully");
  } catch (error) {
    respondFailure(res, error);
  }
}

module.exports = {
  createVoucher,
  getVouchers,
  updateVoucher,
  deleteVoucher,
};
