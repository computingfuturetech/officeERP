const fs = require("fs");
const csv = require("csv-parser");
const MemberList = require("../../models/memberModels/memberList");
const { parse } = require("json2csv");

// Map headers from file to internal field names
const mapRow = (row) => {
  return {
    MemberNo: row["Membership No"]?.trim(),
    PurchaserName: row["Purchaser Name"]?.trim(),
    GuardianName: row["Guardian Name"]?.trim(),
    Address: row["Address"]?.trim(),
    CnicNo: row["CNIC No."]?.trim(),
    Area: row["Area"]?.trim(),
    PlotNo: row["Plot No."]?.trim(),
    Block: row["Block"]?.trim(),
    Phase: row["Phase"]?.trim(),
    Category: row["Category"]?.trim(),
  };
};

const validateRow = async (row, csvDuplicateMap) => {
  const errors = [];

  if (!row.MemberNo) errors.push("Member No is required");
  if (!row.PurchaserName) errors.push("Purchase Name is required");
  if (!row.Address) errors.push("Address is required");
  if (!row.Category) errors.push("Category is required");
  if (!row.CnicNo) {
    errors.push("CNIC No is required");
  } else {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    const matches = row.CnicNo.match(/\d{5}-\d{7}-\d{1}/g);

    if (!matches || matches.length === 0) {
      errors.push("No valid CNICs found in the format");
    } else {
      const invalidCnic = matches.find((c) => !cnicRegex.test(c));
      if (invalidCnic) errors.push(`Invalid CNIC: ${invalidCnic}`);
    }
  }

  if (row.MemberNo) {
    if (csvDuplicateMap[row.MemberNo]) {
      errors.push("Duplicate MemberNo in CSV");
    }
    csvDuplicateMap[row.MemberNo] = true;
  }

  const existingMember = await MemberList.findOne({ msNo: row.MemberNo });
  if (existingMember) errors.push("MemberNo already exists");

  return errors;
};

const readCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(mapRow(data))) // Map row headers here
      .on("end", () => resolve(results))
      .on("error", reject);
  });
};

const validateCsvFile = async (req, res) => {
  try {
    const records = await readCsv(req.file.path);
    const invalidRecords = [];
    let successCount = 0;
    let duplicateCount = 0;
    const csvDuplicateMap = {};
    let csvDuplicateCount = 0;

    for (const row of records) {
      const errors = await validateRow(row, csvDuplicateMap);

      if (errors.includes("MemberNo already exists")) {
        duplicateCount++;
      }

      if (errors.includes("Duplicate MemberNo in CSV")) {
        csvDuplicateCount++;
      }
      if (errors.length > 0) {
        row.Reasons = errors.join("; ");
        invalidRecords.push(row);
      } else {
        successCount++;
      }
    }

    res.status(200).json({
      status: "success",
      message: "Validation complete",
      total: records.length,
      successCount,
      duplicateCount,
      csvDuplicateCount,
      invalidCount: invalidRecords.length,
      invalidRecords,
    });
  } catch (err) {
    res.status(500).json({ message: "Validation failed", error: err.message });
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  }
};

const uploadValidMembers = async (req, res) => {
  try {
    const records = await readCsv(req.file.path);
    const validRecords = [];
    const invalidRecords = [];
    const csvDuplicateMap = {};

    for (const row of records) {
      const errors = await validateRow(row, csvDuplicateMap);
      if (errors.length > 0) {
        row.Reasons = errors.join("; ");
        invalidRecords.push(row);
      } else {
        validRecords.push(row);
      }
    }

    for (const v of validRecords) {
      const existingMember = await MemberList.findOne({ msNo: v.MemberNo });
      if (existingMember) continue;

      // if (v.PlotNo && v.Phase && v.Block && v.Category) {
      //   const existingPlot = await MemberList.findOne({
      //     plotNo: v.PlotNo,
      //     phase: v.Phase,
      //     block: v.Block,
      //     category: v.Category,
      //   });
      //   if (existingPlot) continue;
      // }

      const member = new MemberList({
        msNo: v.MemberNo,
        area: v.Area,
        phase: v.Phase,
        purchaseName: v.PurchaserName,
        guardianName: v.GuardianName,
        address: v.Address,
        cnicNo: v.CnicNo,
        plotNo: v.PlotNo,
        block: v.Block,
        category: v.Category,
      });

      await member.save();
    }

    const errorCsv = parse(invalidRecords);
    const filePath = `uploads/invalid_members_${Date.now()}.csv`;
    fs.writeFileSync(filePath, errorCsv);

    res.status(200).json({
      status: "success",
      inserted: validRecords.length,
      rejected: invalidRecords.length,
      errorFile: filePath,
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  } finally {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
  }
};

module.exports = {
  validateCsvFile,
  uploadValidMembers,
};
