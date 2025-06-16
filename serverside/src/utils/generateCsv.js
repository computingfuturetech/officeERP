const { Parser } = require("json2csv");

module.exports = async function generateCsv(fields, fieldsKeyMapping, data) {
  try {
    const json2csvParser = new Parser({ fields });
    const formattedData = data.map((record) => {
      const formattedRecord = {};
      for (const field of fields) {
        formattedRecord[field] = record[fieldsKeyMapping[field] || field];
      }
      return formattedRecord;
    });
    const csv = json2csvParser.parse(formattedData);
    return csv;
  } catch (error) {
    console.error("CSV Generation Error:", error);
    throw new Error("Error while generating csv");
  }
};
