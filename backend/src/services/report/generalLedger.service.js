const { ApiError } = require("../../utils/error.util");
const { isValidDate, formatDateV1 } = require("../../utils/common.util");
const { generatePdfFromHtml } = require("../../utils/pdf.util");
const {
  generateLedgerHtml,
  getDynamicGridHtml,
  getDynamicTableHtml,
} = require("../../utils/report.util");
const { generateCsvFromRows } = require("../../utils/csv.util");
const VoucherEntry = require("../../models/voucherEntry/voucherEntry.model");
const {
  getDescendantAccounts,
} = require("../chartOfAccounts/chartOfAccounts.service");
const ChartOfAccounts = require("../../models/chartOfAccounts/chartOfAccounts.model");
const { ACCOUNT_TYPE_DEBIT_CREDIT_RULES } = require("../../config/constants");

function calculateLedgerEntryBalance(
  accountType,
  previousBalance,
  creditAmount,
  debitAmount
) {
  const transactionType = debitAmount ? "debit" : "credit";
  const amount = debitAmount || creditAmount;
  const rule = ACCOUNT_TYPE_DEBIT_CREDIT_RULES[accountType][transactionType];
  if (rule === "increase") {
    return previousBalance + amount;
  } else {
    return previousBalance - amount;
  }
}

async function generateGeneralLedger(startDate, endDate, accountId) {
  const filters = {
    "voucher.status": "Posted"
  };
  let account;

  if (accountId) {
    account = await ChartOfAccounts.findById(accountId);
    if (!account) throw new ApiError(404, "Account not found");
    const descendantAccounts = await getDescendantAccounts(account.code);
    const descendantAccountIds = descendantAccounts.map((acc) => acc._id);
    const accountIds = [account._id, ...descendantAccountIds];
    filters["account"] = { $in: accountIds };
  }

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

  const voucherEntries = await VoucherEntry.aggregate([
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
    // Sort by voucher.date and voucher.createdAt
    {
      $sort: {
        "voucher.voucherDate": 1,
        "voucher.createdAt": 1,
        "createdAt": 1,
      },
    },
    // Project to shape the output
    {
      $project: {
        _id: 0,
        "voucher.voucherNumber": 1,
        "voucher.voucherDate": 1,
        status: 1,
        "account.name": 1,
        "account.type": 1,
        creditAmount: 1,
        debitAmount: 1,
        particulars: 1,
      },
    },
  ]);

  let previousBalance = 0;
  const generalLedgerData = [];
  for (const voucherEntry of voucherEntries) {
    let balance = calculateLedgerEntryBalance(
      voucherEntry.account.type,
      previousBalance,
      voucherEntry.creditAmount,
      voucherEntry.debitAmount
    );
    previousBalance = balance;
    generalLedgerData.push({
      voucherNumber: voucherEntry.voucher.voucherNumber,
      voucherDate: voucherEntry.voucher.voucherDate,
      accountName: voucherEntry.account.name,
      accountType: voucherEntry.account.type,
      creditAmount: voucherEntry.creditAmount,
      debitAmount: voucherEntry.debitAmount,
      particulars: voucherEntry.particulars,
      balance,
    });
  }

  return { account, generalLedgerData };
}

function generateGeneralLedgerHtml(
  startDate,
  endDate,
  account,
  generalLedgerData
) {
  const firstEntry = generalLedgerData[0];
  const lastEntry = generalLedgerData[generalLedgerData.length - 1];
  const summary = {
    "START DATE": formatDateV1(
      isValidDate(startDate) ? startDate : firstEntry.voucherDate
    ),
    "END DATE": formatDateV1(
      isValidDate(endDate) ? endDate : lastEntry.voucherDate
    ),
    "STARTING BALANCE": firstEntry.balance,
    "CLOSING BALANCE": lastEntry.balance,
  };
  if (account) summary["ACCOUNT"] = `${account.code} ${account.name}`;

  for (const entry of generalLedgerData) {
    const transactionType = entry.debitAmount ? "debit" : "credit";
    const key = entry.debitAmount ? "debitAmount" : "creditAmount";
    const accountType = entry.accountType;
    const rule = ACCOUNT_TYPE_DEBIT_CREDIT_RULES[accountType][transactionType];
    if (rule === "increase") {
      entry[key] = `<span style="color: green;">+${entry[key]}</span>`;
    } else {
      entry[key] = `<span style="color: red;">-${entry[key]}</span>`;
    }
    entry.voucherDate = formatDateV1(entry.voucherDate);
  }

  const pageTitle = "General Ledger";
  const ledgerHeadingHtml = "General Ledger";
  const ledgerDetailHtml = getDynamicGridHtml(summary);
  const ledgerTableHtml = getDynamicTableHtml({
    columns: [
      {
        label: "Date",
        key: "voucherDate",
      },
      {
        label: "Voucher#",
        key: "voucherNumber",
      },
      {
        label: "Account",
        key: "accountName",
      },
      {
        label: "Particulars",
        key: "particulars",
      },
      {
        label: "Credit",
        key: "creditAmount",
      },
      {
        label: "Debit",
        key: "debitAmount",
      },
      {
        label: "Balance",
        key: "balance",
      },
    ],
    data: generalLedgerData,
  });

  return generateLedgerHtml(
    pageTitle,
    ledgerHeadingHtml,
    ledgerDetailHtml,
    ledgerTableHtml
  );
}

function generateGeneralLedgerCsvRows(
  startDate,
  endDate,
  account,
  generalLedgerData
) {
  const firstEntry = generalLedgerData[0];
  const lastEntry = generalLedgerData[generalLedgerData.length - 1];

  const summaryRows = [
    [
      "START DATE",
      formatDateV1(isValidDate(startDate) ? startDate : firstEntry.voucherDate),
    ],
    [
      "END DATE",
      formatDateV1(isValidDate(endDate) ? endDate : lastEntry.voucherDate),
      ,
    ],
    ["STARTING BALANCE", firstEntry.balance],
    ["CLOSING BALANCE", lastEntry.balance],
  ];

  if (account) {
    summaryRows.push(["ACCOUNT", `${account.code} ${account.name}`]);
  }

  summaryRows.push([]); // blank row

  for (const entry of generalLedgerData) {
    const transactionType = entry.debitAmount ? "debit" : "credit";
    const key = entry.debitAmount ? "debitAmount" : "creditAmount";
    const accountType = entry.accountType;
    const rule = ACCOUNT_TYPE_DEBIT_CREDIT_RULES[accountType][transactionType];
    if (rule === "increase") {
      entry[key] = `+${entry[key]}`;
    } else {
      entry[key] = `-${entry[key]}`;
    }
    entry.voucherDate = formatDateV1(entry.voucherDate);
  }

  const fields = [
    "Date",
    "Voucher#",
    "Account",
    "Particulars",
    "Credit",
    "Debit",
    "Balance",
  ];

  const fieldsKeyMapping = {
    Date: "voucherDate",
    "Voucher#": "voucherNumber",
    Account: "accountName",
    Particulars: "particulars",
    Credit: "creditAmount",
    Debit: "debitAmount",
    Balance: "balance",
  };

  const tableRows = generalLedgerData.map((entry) =>
    fields.map((field) => entry[fieldsKeyMapping[field] ?? field] ?? "")
  );

  const allRows = [...summaryRows, fields, ...tableRows];
  return allRows;
}

async function generateGeneralLedgerPdf(startDate, endDate, accountId) {
  const { account, generalLedgerData } = await generateGeneralLedger(
    startDate,
    endDate,
    accountId
  );
  if (generalLedgerData.length === 0) {
    throw new ApiError(404, "No record found");
  }

  const generalLedgerHtml = generateGeneralLedgerHtml(
    startDate,
    endDate,
    account,
    generalLedgerData
  );

  const pdf = await generatePdfFromHtml(generalLedgerHtml);
  return pdf;
}

async function generateGeneralLedgerCsv(startDate, endDate, accountId) {
  const { account, generalLedgerData } = await generateGeneralLedger(
    startDate,
    endDate,
    accountId
  );
  if (generalLedgerData.length === 0) {
    throw new ApiError(404, "No record found");
  }

  const generaledgerCsvRows = generateGeneralLedgerCsvRows(
    startDate,
    endDate,
    account,
    generalLedgerData
  );

  const csv = generateCsvFromRows(generaledgerCsvRows);
  return csv;
}

module.exports = {
  generateGeneralLedgerPdf,
  generateGeneralLedgerCsv,
};
