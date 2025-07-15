const {
  generateBalanceSheetPdf,
  generateBalanceSheetCsv,
} = require("../../services/report/balanceSheet.service");
const {
  generateGeneralLedgerPdf,
  generateGeneralLedgerCsv,
} = require("../../services/report/generalLedger.service");
const {
  generateIncomeStatementPdf,
  generateIncomeStatementCsv,
} = require("../../services/report/incomeStatement.service");
const { ApiError } = require("../../utils/error.util");
const { respondFailure } = require("../../utils/res.util");

async function getGeneralLedger(req, res) {
  try {
    const { format, startDate, endDate, accountId } = req.query;

    const validFormats = ["pdf", "csv"];
    if (!format) {
      throw new ApiError(400, "Report format required");
    }
    if (!validFormats.includes(format)) {
      throw new ApiError(400, "Invalid report format requested");
    }

    if (format === "pdf") {
      const pdf = await generateGeneralLedgerPdf(startDate, endDate, accountId);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": pdf.length,
        "Content-Disposition": 'attachment; filename="general-ledger.pdf"',
      });
      return res.end(pdf);
    } else if (format === "csv") {
      const csv = await generateGeneralLedgerCsv(startDate, endDate, accountId);
      res.header("Content-Type", "text/csv");
      res.attachment("general-ledger.csv");
      res.send(csv);
    }
  } catch (error) {
    respondFailure(res, error);
  }
}

async function getIncomeStatement(req, res) {
  try {
    const { format, startDate, endDate } = req.query;
    const validFormats = ["pdf", "csv"];
    if (!format) {
      throw new ApiError(400, "Report format required");
    }
    if (!validFormats.includes(format)) {
      throw new ApiError(400, "Invalid report format requested");
    }

    if (format === "pdf") {
      const pdf = await generateIncomeStatementPdf(startDate, endDate);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": pdf.length,
        "Content-Disposition": 'attachment; filename="income-statement.pdf"',
      });
      return res.end(pdf);
    } else if (format === "csv") {
      const csv = await generateIncomeStatementCsv(startDate, endDate);
      res.header("Content-Type", "text/csv");
      res.attachment("income-statement.csv");
      res.send(csv);
    }
  } catch (error) {
    respondFailure(res, error);
  }
}

async function getBalanceSheet(req, res) {
  try {
    const { format, startDate, endDate } = req.query;
    const validFormats = ["pdf", "csv"];
    if (!format) {
      throw new ApiError(400, "Report format required");
    }
    if (!validFormats.includes(format)) {
      throw new ApiError(400, "Invalid report format requested");
    }

    if (format === "pdf") {
      const pdf = await generateBalanceSheetPdf(startDate, endDate);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": pdf.length,
        "Content-Disposition": 'attachment; filename="balance-sheet.pdf"',
      });
      return res.end(pdf);
    } else if (format === "csv") {
      const csv = await generateBalanceSheetCsv(startDate, endDate);
      res.header("Content-Type", "text/csv");
      res.attachment("balance-sheet.csv");
      res.send(csv);
    }
  } catch (error) {
    respondFailure(res, error);
  }
}

module.exports = {
  getGeneralLedger,
  getIncomeStatement,
  getBalanceSheet,
};
