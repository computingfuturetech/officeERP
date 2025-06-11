const fs = require("fs");
const csv = require("csv-parser");
const MemberList = require("../../models/memberModels/memberList");
const { parse } = require("json2csv");

const validateRow = async (row) => {
  const errors = [];

  if (!row.MemberNo) errors.push("Member No is required");
  if (!row.Phase) errors.push("Phase is required");
  if (!row.PurchaserName) errors.push("Purchase Name is required");
  if (!row.Address) errors.push("Address is required");
  if (!row.CnicNo) {
    errors.push("CNIC No is required");
  } else {
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    const invalidCnic = row.CnicNo.split(",")
      .map((c) => c.trim())
      .find((c) => !cnicRegex.test(c));
    if (invalidCnic) errors.push(`Invalid CNIC: ${invalidCnic}`);
  }

  if (row.PlotNo) {
    if (!row.Block || !row.Category || !row.Phase) {
      errors.push("Block, Category, and Phase required when Plot No is given");
    } else {
      const existingPlot = await MemberList.findOne({
        plotNo: row.PlotNo,
        phase: row.Phase,
        block: row.Block,
        category: row.Category,
      });
      if (existingPlot) errors.push("Duplicate plot found");
    }
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
      .on("data", (data) => results.push(data))
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

    for (const row of records) {
      const errors = [];

      // Manual inline validation instead of calling validateRow to add duplicateCount
      if (!row.MemberNo) errors.push("Member No is required");
      if (!row.Phase) errors.push("Phase is required");
      if (!row.PurchaserName) errors.push("Purchase Name is required");
      if (!row.Address) errors.push("Address is required");

      if (!row.CnicNo) {
        errors.push("CNIC No is required");
      } else {
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        const invalidCnic = row.CnicNo.split(",")
          .map((c) => c.trim())
          .find((c) => !cnicRegex.test(c));
        if (invalidCnic) errors.push(`Invalid CNIC: ${invalidCnic}`);
      }

      if (row.PlotNo) {
        if (!row.Block || !row.Category || !row.Phase) {
          errors.push(
            "Block, Category, and Phase required when Plot No is given"
          );
        } else {
          const existingPlot = await MemberList.findOne({
            plotNo: row.PlotNo,
            phase: row.Phase,
            block: row.Block,
            category: row.Category,
          });
          if (existingPlot) errors.push("Duplicate plot found");
        }
      }

      const existingMember = await MemberList.findOne({ msNo: row.MemberNo });
      if (existingMember) {
        errors.push("MemberNo already exists");
        duplicateCount++;
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
      invalidCount: invalidRecords.length,
      invalidRecords,
    });
  } catch (err) {
    res.status(500).json({ message: "Validation failed", error: err.message });
  }
};

const uploadValidMembers = async (req, res) => {
  try {
    const records = await readCsv(req.file.path);
    const validRecords = [];
    const invalidRecords = [];

    for (const row of records) {
      const errors = await validateRow(row);
      if (errors.length > 0) {
        row.Reasons = errors.join("; ");
        invalidRecords.push(row);
      } else {
        validRecords.push(row);
      }
    }

    // Insert valid
    for (const v of validRecords) {
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

    // Create CSV of invalids
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
  }
};

module.exports = {
  validateCsvFile,
  uploadValidMembers,
};
