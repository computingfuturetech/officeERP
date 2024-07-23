const express = require("express");
const router = express.Router();
const csvParser = require("csv-parser");
const fs = require("fs");
const path = require("path");
const MemberList = require("../../models/memberModels/memberList");

module.exports = {
  memberList: async (req, res) => {
    try {
      const { filePath } = path.join(__dirname, `../../uploads/${fileName}`);

      if (!filePath) {
        return res.status(400).json({ message: "File path is required" });
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csvParser({ separator: "," }))
        .on("data", (data) => {
          const mappedData = {
            srNo: parseInt(data["Sr. #"], 10) || 0,
            msNo: parseInt(data["Mship No."], 10) || 0,
            area: parseInt(data["AREA"], 10) || 0,
            phase: data["Phase"],
            purchaseName: data["PURCHASER NAME"],
            address: data["ADDRESS"],
            cnicNo: data["CNIC No."],
            plotNo: data["Plot No."],
            block: data["Block"],
          };
          results.push(mappedData);
        })
        .on("end", async () => {
          try {
            const validResults = results.filter(
              (item) => !isNaN(item.msNo) && !isNaN(item.area) && item.plotNo
            );

            await MemberList.insertMany(validResults);
            res.json({ message: "Data imported successfully" });
          } catch (err) {
            console.error("Error saving data to MongoDB:", err);
            res.status(500).json({ message: "Internal server error" });
          }
        });
    } catch (err) {
      console.error("Error uploading CSV:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
