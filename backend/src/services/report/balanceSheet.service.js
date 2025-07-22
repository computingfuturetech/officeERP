const VoucherEntry = require("../../models/voucherEntry/voucherEntry.model");
const { isValidDate, formatDateV1 } = require("../../utils/common.util");
const { generateCsvFromRows } = require("../../utils/csv.util");
const { generatePdfFromHtml } = require("../../utils/pdf.util");
const reportUtils = require("../../utils/report.util");

async function generateBalanceSheet(startDate, endDate) {
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
    // Only include Asset, Liability and Equity accounts
    {
      $match: {
        "account.type": { $in: ["Asset", "Liability", "Equity"] },
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
          $switch: {
            branches: [
              {
                case: { $eq: ["$_id.type", "Asset"] },
                then: { $subtract: ["$totalDebit", "$totalCredit"] },
              },
              {
                case: { $in: ["$_id.type", ["Liability", "Equity"]] },
                then: { $subtract: ["$totalCredit", "$totalDebit"] },
              },
            ],
          },
        },
      },
    },
  ]);

  // Organize final output
  const balanceSheet = {
    startDate,
    endDate,
    assets: [],
    liabilities: [],
    equity: [],
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
  };

  for (const row of result) {
    if (row.type === "Asset") {
      balanceSheet.assets.push({
        accountName: row.name,
        amount: row.amount,
      });
      balanceSheet.totalAssets += row.amount;
    } else if (row.type === "Liability") {
      balanceSheet.liabilities.push({
        accountName: row.name,
        amount: row.amount,
      });
      balanceSheet.totalLiabilities += row.amount;
    } else if (row.type === "Equity") {
      balanceSheet.equities.push({
        accountName: row.name,
        amount: row.amount,
      });
      balanceSheet.totalEquity += row.amount;
    }
  }

  return balanceSheet;
}

function generateBalanceSheetHtml(data) {
  const balanceSheetHeadingHtml = "Balance Sheet";
  const summary = {};
  if (isValidDate(data.startDate))
    summary["START DATE"] = formatDateV1(data.startDate);
  if (isValidDate(data.endDate))
    summary["END DATE"] = formatDateV1(data.endDate);

  const balanceSheetDetailHtml = reportUtils.getDynamicGridHtml(summary);

  const assetRows = [
    ...data.assets,
    { accountName: "Total", amount: data.totalAssets },
  ];
  const liabilityRows = [
    ...data.liabilities,
    { accountName: "Total", amount: data.totalLiabilities },
  ];
  const equityRows = [
    ...data.equity,
    { accountName: "Total", amount: data.totalEquity },
  ];

  let balanceSheetTablesHtml = "";
  balanceSheetTablesHtml = balanceSheetTablesHtml +=
    reportUtils.getDynamicTableHtml({
      heading: "Assets",
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
      data: assetRows,
    });

  balanceSheetTablesHtml = balanceSheetTablesHtml +=
    reportUtils.getDynamicTableHtml({
      heading: "Liabilities",
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
      data: liabilityRows,
    });

  balanceSheetTablesHtml = balanceSheetTablesHtml +=
    reportUtils.getDynamicTableHtml({
      heading: "Equity",
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
      data: equityRows,
    });

  const html = reportUtils.generateBalanceSheetHtml(
    balanceSheetHeadingHtml,
    balanceSheetDetailHtml,
    balanceSheetTablesHtml
  );
  return html;
}

function generateBalanceSheetCsvRows(data) {
  const rows = [];

  if (isValidDate(data.startDate)) {
    rows.push(["START DATE", formatDateV1(data.startDate)]);
  }
  if (isValidDate(data.endDate)) {
    rows.push(["END DATE", formatDateV1(data.endDate)]);
  }
  rows.push([]);

  rows.push(["Assets"]);
  rows.push(["Account", "Amount"]);
  for (const item of data.assets) {
    rows.push([item.accountName, item.amount]);
  }
  rows.push(["Total", data.totalAssets]);
  rows.push([]);

  rows.push(["Liabilities"]);
  rows.push(["Account", "Amount"]);
  for (const item of data.liabilities) {
    rows.push([item.accountName, item.amount]);
  }
  rows.push(["Total", data.totalLiabilities]);
  rows.push([]);

  rows.push(["Equity"]);
  rows.push(["Account", "Amount"]);
  for (const item of data.equity) {
    rows.push([item.accountName, item.amount]);
  }
  rows.push(["Total", data.totalEquity]);

  return rows;
}


async function generateBalanceSheetPdf(startDate, endDate) {
  const balanceSheetData = await generateBalanceSheet(startDate, endDate);
  const balanceSheetHtml = generateBalanceSheetHtml(balanceSheetData);
  const pdf = await generatePdfFromHtml(balanceSheetHtml);
  return pdf;
}

async function generateBalanceSheetCsv(startDate, endDate) {
  const balanceSheetData = await generateBalanceSheet(startDate, endDate);
  const balanceSheetCsvRows = generateBalanceSheetCsvRows(balanceSheetData);
  const csv = generateCsvFromRows(balanceSheetCsvRows);
  return csv;
}

module.exports = {
  generateBalanceSheetPdf,
  generateBalanceSheetCsv,
};
