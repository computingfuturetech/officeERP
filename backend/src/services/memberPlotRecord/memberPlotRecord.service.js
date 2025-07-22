const mongoose = require("mongoose");
const MemberPlotRecord = require("../../models/memberPlotRecord/memberPlotRecord.model");
const { ApiError } = require("../../utils/error.util");
const json2csv = require("json2csv");
const fs = require("fs/promises");
const path = require("path");
const { getNestedValue } = require("../../utils/common.util");
const { PLOT_CATEGORIES } = require("../../config/constants");

async function createMemberPlotRecord(data) {
  return await MemberPlotRecord.create(data);
}

async function updateMemberPlotRecord(id, updateData) {
  const updatedRecord = await MemberPlotRecord.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );
  if (!updatedRecord) throw new ApiError(404, "Record not found");
  return updatedRecord;
}

async function deleteMemberPlotRecord(id) {
  const deletedRecord = await MemberPlotRecord.findByIdAndDelete(id);
  if (!deletedRecord) throw new ApiError(404, "Record not found");
}

async function transferPlot({ fromMemberPlotRecordId, toMember, date }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  const fromRecord = await MemberPlotRecord.findById(fromMemberPlotRecordId);
  if (!fromRecord) throw new ApiError(404, "From record not found");

  fromRecord.status = "Transferred";
  fromRecord.date = new Date(date);
  await fromRecord.save({ session });

  const [toRecord] = await MemberPlotRecord.create(
    [
      {
        member: toMember,
        plot: fromRecord.plot,
        membershipNumber: fromRecord.membershipNumber,
        status: "Active",
        date: new Date(date),
      },
    ],
    { session }
  );

  await session.commitTransaction();
  session.endSession();

  return {
    fromRecord,
    toRecord,
  };
}

async function validateRecord(
  record,
  validationState = {
    validRecords: [],
    invalidRecords: [],
    duplicatesInCSVMap: {},
    duplicatesInCSVCount: 0,
    duplicatesInDBCount: 0,
  }
) {
  const errors = [];

  // validating required fields
  const requiredFields = [
    { key: "membershipNumber", message: "Membership number is required" },
    { key: "member.name", message: "Member name is required" },
    { key: "member.cnic", message: "Member cnic is required" },
    { key: "plot.number", message: "Plot number is required" },
    { key: "plot.location.phase", message: "Plot phase is required" },
  ];
  for (const f of requiredFields) {
    const value = getNestedValue(record, f.key);
    if (!value) errors.push(f.message);
  }

  // validating cnic field
  if (record.member?.cnic) {
    const cnicRegex = /\b\d{5}-\d{7}-\d{1}\b/g;
    const matches = record.member.cnic.match(cnicRegex);
    if (!matches) errors.push("No valid cnic found");
  }

  // validating membership number
  if (record.membershipNumber) {
    if (validationState.duplicatesInCSVMap[record.membershipNumber]) {
      errors.push("Duplicate membership number");
      validationState.duplicatesInCSVCount++;
    }
    validationState.duplicatesInCSVMap[record.membershipNumber] = true;

    const existingRecordInDB = await MemberPlotRecord.findOne({
      membershipNumber: record.membershipNumber,
      status: "Active",
    });
    if (existingRecordInDB) {
      errors.push("Membership record already exist in database");
      validationState.duplicatesInDBCount++;
    }
  }

  // validating plot area value
  if (record.plot?.area?.value) {
    if (isNaN(Number(record.plot.area.value))) {
      errors.push("Invalid plot area value");
    }
  }

  // validating plot category
  if (record.plot?.category !== undefined) {
    if (!PLOT_CATEGORIES.includes(record.plot.category)) {
      errors.push("Invalid plot category");
    }
  }

  // if there is any error
  if (errors.length > 0) {
    record.reasons = errors.join(", ");
    validationState.invalidRecords.push(record);
  }

  // if there is no error
  else {
    validationState.validRecords.push(record);
  }

  return errors;
}

function flatRecords(records) {
  return records.map((r) => ({
    "Membership No.": r.membershipNumber,
    "Name": r.member?.name,
    "Guardian Name": r.member?.guardianName,
    "CNIC No.": r.member?.cnic,
    Address: r.member?.address,
    "Plot No.": r.plot?.number,
    Phase: r.plot?.location?.phase,
    Block: r.plot?.location?.block,
    Category: r.plot?.category,
    Area: r.plot?.area?.value,
    Reasons: r.reasons,
  }));
}

async function bulkValidateMemberPlotRecords(records = []) {
  const validationState = {
    validRecords: [],
    invalidRecords: [],
    duplicatesInCSVMap: {},
    duplicatesInCSVCount: 0,
    duplicatesInDBCount: 0,
  };

  for (const record of records) {
    await validateRecord(record, validationState);
  }

  return {
    summary: {
      totalRecordsCount: records.length,
      validRecordsCount: validationState.validRecords.length,
      invalidRecordsCount: validationState.invalidRecords.length,
      duplicatesInCSVCount: validationState.duplicatesInCSVCount,
      duplicatesInDBCount: validationState.duplicatesInDBCount,
    },
    invalidRecords: flatRecords(validationState.invalidRecords),
  };
}

async function bulkUploadMemberPlotRecords(records = []) {
  const validationState = {
    validRecords: [],
    invalidRecords: [],
    duplicatesInCSVMap: {},
    duplicatesInCSVCount: 0,
    duplicatesInDBCount: 0,
  };

  for (const record of records) {
    await validateRecord(record, validationState);
  }

  // let index = 1;
  // for (const vr of validationState.validRecords) {
  //   try {
  //     await MemberPlotRecord.create(vr);
  //   } catch (error) {
  //     console.log(index);
  //     console.log(error.message);
  //     console.log(vr);
  //   }
  //   index++;
  // }

  const insertedRecords = await MemberPlotRecord.insertMany(
    validationState.validRecords
  );

  let fileUrl;
  if (validationState.invalidRecords.length > 0) {
    const flatInvalidRecords = flatRecords(validationState.invalidRecords); 
    const invalidRecordsCSV = json2csv.parse(flatInvalidRecords);
    const now = Date.now();
    const filePath = path.join(
      __dirname,
      `../../../public/assets/invalid-member-plot-records/invalid-records-${now}.csv`
    );
    fileUrl = `/public/assets/invalid-member-plot-records/invalid-records-${now}.csv`;
    fs.writeFile(filePath, invalidRecordsCSV).catch((error) => {
      console.error(error);
    });
  }

  return {
    summary: {
      successfulInserts: insertedRecords.length,
      failedInserts: records.length - insertedRecords.length,
    },
    invalidRecordsCSVUrl: fileUrl,
  };
}

module.exports = {
  createMemberPlotRecord,
  updateMemberPlotRecord,
  deleteMemberPlotRecord,
  transferPlot,
  bulkValidateMemberPlotRecords,
  bulkUploadMemberPlotRecords,
};
