const fs = require("fs");
const csv = require("csv-parser");

function generateCsvFromRows(rows) {
  return rows.map((row) => row.join(",")).join("\n");
}

function readCsvFromFileStorage(filePath, mapRow) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push(mapRow?.(data) ?? data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", reject);
  });
}

module.exports = {
  generateCsvFromRows,
  readCsvFromFileStorage
};
