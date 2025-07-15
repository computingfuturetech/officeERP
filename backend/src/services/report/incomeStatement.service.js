const VoucherEntry = require("../../models/voucherEntry/voucherEntry.model");
const { isValidDate, formatDateV1 } = require("../../utils/common.util");
const { generateCsvFromRows } = require("../../utils/csv.util");
const { generatePdfFromHtml } = require("../../utils/pdf.util");
const reportUtils = require("../../utils/report.util");

async function generateIncomeStatement(startDate, endDate) {
  const filters = {
    "voucher.status": "Posted",
  };

  if (isValidDate(startDate)) {
    if (filters["voucher.voucherDate"] == null)
      filters["voucher.voucherDate"] = {};
    filters["voucher.voucherDate"].$gte = new Date(startDate);
  }

  if (isValidDate(endDate)) {
    if (filters["voucher.voucherDate"] == null)
      filters["voucher.voucherDate"] = {};
    filters["voucher.voucherDate"].$lte = new Date(endDate);
  }

  const result = await VoucherEntry.aggregate([
    // Join VoucherEntry with Voucher
    {
      $lookup: {
        from: "vouchers",
        localField: "voucher",
        foreignField: "_id",
        as: "voucher",
      },
    },
    // Unwind the voucher array
    {
      $unwind: "$voucher",
    },
    // Apply filters
    {
      $match: filters,
    },
    // Join VoucherEntry with ChartOfAccount
    {
      $lookup: {
        from: "chartofaccounts",
        localField: "account",
        foreignField: "_id",
        as: "account",
      },
    },
    // Unwind the account array
    {
      $unwind: "$account",
    },
    // Only include Revenue and Expense accounts
    {
      $match: {
        "account.type": { $in: ["Revenue", "Expense"] },
      },
    },
    // Group by account and calculate total debit and credit amounts for each account
    {
      $group: {
        _id: {
          id: "$account._id",
          name: "$account.name",
          type: "$account.type",
        },
        totalDebit: { $sum: "$debitAmount" },
        totalCredit: { $sum: "$creditAmount" },
      },
    },
    // Compute net amount for each account
    {
      $project: {
        name: "$_id.name",
        type: "$_id.type",
        amount: {
          $cond: [
            { $eq: ["$_id.type", "Revenue"] },
            { $subtract: ["$totalCredit", "$totalDebit"] }, // Revenue = credit - debit
            { $subtract: ["$totalDebit", "$totalCredit"] }, // Expense = debit - credit
          ],
        },
      },
    },
  ]);

  // Organize final output
  const incomeStatement = {
    startDate,
    endDate,
    revenue: [],
    expenses: [],
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  };

  for (const row of result) {
    if (row.type === "Revenue") {
      incomeStatement.revenue.push({
        accountName: row.name,
        amount: row.amount,
      });
      incomeStatement.totalRevenue += row.amount;
    } else if (row.type === "Expense") {
      incomeStatement.expenses.push({
        accountName: row.name,
        amount: row.amount,
      });
      incomeStatement.totalExpenses += row.amount;
    }
  }

  incomeStatement.netProfit =
    incomeStatement.totalRevenue - incomeStatement.totalExpenses;

  return incomeStatement;
}

function generateIncomeStatementHtml(data) {
  const incomeStatementHeadingHtml = "Income Statement";
  const summary = {};
  if (isValidDate(data.startDate))
    summary["START DATE"] = formatDateV1(data.startDate);
  if (isValidDate(data.endDate))
    summary["END DATE"] = formatDateV1(data.endDate);

  const incomeStatementDetailHtml = reportUtils.getDynamicGridHtml(summary);

  const revenueRows = [
    ...data.revenue,
    { accountName: "Total", amount: data.totalRevenue },
  ];
  const expenseRows = [
    ...data.expenses,
    { accountName: "Total", amount: data.totalExpenses },
  ];
  const summaryRecords = [
    { description: "Net Profit", amount: data.netProfit },
  ];

  let incomeStatementTablesHtml = "";
  incomeStatementTablesHtml = incomeStatementTablesHtml +=
    reportUtils.getDynamicTableHtml({
      heading: "Revenue",
      columns: [
        {
          label: "Account",
          key: "accountName",
        },
        {
          label: "Amount",
          key: "amount",
        },
      ],
      data: revenueRows,
    });

  incomeStatementTablesHtml = incomeStatementTablesHtml +=
    reportUtils.getDynamicTableHtml({
      heading: "Expenses",
      columns: [
        {
          label: "Account",
          key: "accountName",
        },
        {
          label: "Amount",
          key: "amount",
        },
      ],
      data: expenseRows,
    });

  incomeStatementTablesHtml = incomeStatementTablesHtml +=
    reportUtils.getDynamicTableHtml({
      heading: "Summary",
      columns: [
        {
          label: "Description",
          key: "description",
        },
        {
          label: "Amount",
          key: "amount",
        },
      ],
      data: summaryRecords,
    });

  const html = reportUtils.generateIncomeStatementHtml(
    incomeStatementHeadingHtml,
    incomeStatementDetailHtml,
    incomeStatementTablesHtml
  );
  return html;
}

function generateIncomeStatementCsvRows(data) {
  const rows = [];

  if (isValidDate(data.startDate)) {
    rows.push(["START DATE", formatDateV1(data.startDate)]);
  }
  if (isValidDate(data.endDate)) {
    rows.push(["END DATE", formatDateV1(data.endDate)]);
  }
  rows.push([]);

  rows.push(["Revenue"]);
  rows.push(["Account", "Amount"]);
  for (const item of data.revenue) {
    rows.push([item.accountName, item.amount]);
  }
  rows.push(["Total", data.totalRevenue]);
  rows.push([]);

  rows.push(["Expenses"]);
  rows.push(["Account", "Amount"]);
  for (const item of data.expenses) {
    rows.push([item.accountName, item.amount]);
  }
  rows.push(["Total", data.totalExpenses]);
  rows.push([]);

  rows.push(["Summary"]);
  rows.push(["Description", "Amount"]);
  rows.push(["Net Profit", data.netProfit]);

  return rows;
}

async function generateIncomeStatementPdf(startDate, endDate) {
  const incomeStatementData = await generateIncomeStatement(startDate, endDate);
  const incomeStatementHtml = generateIncomeStatementHtml(incomeStatementData);
  const pdf = await generatePdfFromHtml(incomeStatementHtml);
  return pdf;
}

async function generateIncomeStatementCsv(startDate, endDate) {
  const incomeStatementData = await generateIncomeStatement(startDate, endDate);
  const incomeStatementCsvRows =
    generateIncomeStatementCsvRows(incomeStatementData);
  const csv = generateCsvFromRows(incomeStatementCsvRows);
  return csv;
}

module.exports = {
  generateIncomeStatementPdf,
  generateIncomeStatementCsv,
};
