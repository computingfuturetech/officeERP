const MemberPlotRecord = require("../../models/memberPlotRecord/memberPlotRecord.model");
const { respondSuccess, respondFailure } = require("../../utils/res.util");
const memberPlotRecordService = require("../../services/memberPlotRecord/memberPlotRecord.service");
const commonService = require("../../services/common/common.service");
const { readCsvFromFileStorage } = require("../../utils/csv.util");
const fs = require("fs");
const { ApiError } = require("../../utils/error.util");

async function createMemberPlotRecord(req, res) {
  try {
    const createdRecord = await memberPlotRecordService.createMemberPlotRecord(
      req.body
    );
    respondSuccess(
      res,
      201,
      "Member plot record created successfully",
      createdRecord
    );
  } catch (error) {
    respondFailure(res, error);
  }
}

async function getMemberPlotRecords(req, res) {
  try {
    const { page, limit, pagination, membershipNumber, status } = req.query;
    const filters = {};
    const options = {};
    let data, meta;

    if (status) {
      filters.status = {
        $in: status.split(","),
      };
    }
    if (membershipNumber) {
      filters.membershipNumber = membershipNumber;
    }

    options.sort = { createdAt: -1 };
    options.lean = false;

    if (pagination === "false") {
      data = await commonService.getAllDocuments(
        MemberPlotRecord,
        filters,
        options
      );
    } else {
      options.page = page;
      options.limit = limit;
      const result = await commonService.getDocuments(
        MemberPlotRecord,
        filters,
        options
      );
      data = result.data;
      meta = result.meta;
    }

    respondSuccess(
      res,
      200,
      "Member plot records retrieved successfully",
      data,
      meta
    );
  } catch (error) {
    respondFailure(res, error);
  }
}

async function updateMemberPlotRecord(req, res) {
  try {
    const updatedRecord = await memberPlotRecordService.updateMemberPlotRecord(
      req.params.id,
      req.body
    );
    respondSuccess(
      res,
      200,
      "Member plot record updated successfully",
      updatedRecord
    );
  } catch (error) {
    respondFailure(res, error);
  }
}

async function deleteMemberPlotRecord(req, res) {
  try {
    await memberPlotRecordService.deleteMemberPlotRecord(req.params.id);
    respondSuccess(res, 200, "Member plot record deleted successfully");
  } catch (error) {
    respondFailure(res, error);
  }
}

async function transferPlot(req, res) {
  try {
    const data = await memberPlotRecordService.transferPlot(req.body);
    respondSuccess(res, 200, "Plot transfered successfully", data);
  } catch (error) {
    respondFailure(res, error);
  }
}

function mapCsvRow(row) {
  return {
    membershipNumber: row["Membership No."]?.trim(),
    member: {
      name: row["Name"]?.trim(),
      guardianName: row["Guardian Name"]?.trim(),
      cnic: row["CNIC No."]?.trim(),
      address: row["Address"]?.trim(),
    },
    plot: {
      number: row["Plot No."]?.trim(),
      category: row["Category"]?.trim(),
      area: {
        value: row["Area"]?.trim(),
      },
      location: {
        phase: row["Phase"]?.trim(),
        block: row["Block"]?.trim(),
      },
    },
  };
}

async function bulkValidateMemberPlotRecords(req, res) {
  try {
    if (!req.file)
      throw new ApiError(400, "No file uploaded. Please attach a CSV file.");
    if (req.file.mimetype !== "text/csv")
      throw new ApiError(400, "Invalid file type. Only CSV files are allowed.");

    const csvRecords = await readCsvFromFileStorage(req.file.path, mapCsvRow);
    const result = await memberPlotRecordService.bulkValidateMemberPlotRecords(
      csvRecords
    );

    respondSuccess(
      res,
      200,
      "Bulk member plot records validation complete",
      result
    );
  } catch (error) {
    respondFailure(res, error);
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  }
}

async function bulkUploadMemberPlotRecords(req, res) {
  try {
    if (!req.file)
      throw new ApiError(400, "No file uploaded. Please attach a CSV file.");
    if (req.file.mimetype !== "text/csv")
      throw new ApiError(400, "Invalid file type. Only CSV files are allowed.");

    const csvRecords = await readCsvFromFileStorage(req.file.path, mapCsvRow);
    const result = await memberPlotRecordService.bulkUploadMemberPlotRecords(
      csvRecords
    );

    respondSuccess(
      res,
      200,
      "Bulk member plot records upload successful",
      result
    );
  } catch (error) {
    respondFailure(res, error);
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  }
}

module.exports = {
  createMemberPlotRecord,
  getMemberPlotRecords,
  updateMemberPlotRecord,
  deleteMemberPlotRecord,
  transferPlot,
  bulkValidateMemberPlotRecords,
  bulkUploadMemberPlotRecords,
};
