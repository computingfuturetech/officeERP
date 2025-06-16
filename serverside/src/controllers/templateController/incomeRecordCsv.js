const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const GeneralLedger = require("../../models/ledgerModels/generalLedger");
const LiabilitiesSchema = require("../../models/incomeModels/libility/libility");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const IncomeStatement = require("../../models/incomeStatementModel/incomeStatement");

function formatForDisplay(amount) {
  return amount < 0 ? `(${Math.abs(amount).toFixed(2)})` : amount.toFixed(2);
}

function generateCsvFromRows(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
        )
        .join(",")
    )
    .join("\n");
}

module.exports = {
  generateCSV: async (req, res) => {
    try {
      let { year, taxation, accumulated_surplus_brought_forward } = req.query;
      taxation = Number(taxation) || 0;
      accumulated_surplus_brought_forward =
        Number(accumulated_surplus_brought_forward) || 0;

      if (!year) {
        return res.status(400).json({ message: "Year is required." });
      }

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      const liabilityAccounts = await LiabilitiesSchema.find(
        {},
        "headOfAccount"
      );
      const liabilityAccountIds = liabilityAccounts.map((acc) =>
        acc.headOfAccount.toString()
      );

      const ledgerRecords = await GeneralLedger.find({
        date: {
          ...(isNaN(startDate) ? {} : { $gte: startDate }),
          ...(isNaN(endDate) ? {} : { $lte: endDate }),
        },
        $or: [{ credit: { $exists: true } }, { debit: { $exists: true } }],
      });

      if (!ledgerRecords.length) {
        return res.status(404).json({
          message: "No ledger records found for the provided year.",
        });
      }

      let totalIncome = 0;
      let totalExpense = 0;

      const incomeHeadMap = {};
      ledgerRecords.forEach(({ incomeHeadOfAccount, credit }) => {
        if (
          !incomeHeadOfAccount ||
          liabilityAccountIds.includes(incomeHeadOfAccount.toString())
        ) {
          return;
        }
        incomeHeadMap[incomeHeadOfAccount] =
          (incomeHeadMap[incomeHeadOfAccount] || 0) + credit;
      });

      const mainHeadMap = {};
      const subHeadMap = {};
      ledgerRecords.forEach(
        ({ mainHeadOfAccount, subHeadOfAccount, debit }) => {
          const expenseHead = mainHeadOfAccount || subHeadOfAccount;
          if (
            !expenseHead ||
            liabilityAccountIds.includes(expenseHead.toString())
          ) {
            return;
          }
          if (mainHeadOfAccount) {
            mainHeadMap[mainHeadOfAccount] =
              (mainHeadMap[mainHeadOfAccount] || 0) + debit;
          }
          if (subHeadOfAccount) {
            subHeadMap[subHeadOfAccount] =
              (subHeadMap[subHeadOfAccount] || 0) + debit;
          }
        }
      );

      const incomeRecords = [];
      for (const [id, amount] of Object.entries(incomeHeadMap)) {
        const record = await IncomeHeadOfAccount.findById(id);
        if (record) {
          const name =
            record.headOfAccount === "Bank Profit"
              ? "Return on Deposit"
              : record.headOfAccount;
          incomeRecords.push({
            headOfAccount: name,
            amount: amount.toFixed(2),
          });
          totalIncome += amount;
        }
      }

      const expenseRecords = [];
      for (const [id, amount] of Object.entries(mainHeadMap)) {
        const record = await MainHeadOfAccount.findById(id);
        if (record) {
          expenseRecords.push({
            headOfAccount: record.headOfAccount,
            amount: amount.toFixed(2),
          });
          totalExpense += amount;
        }
      }

      for (const [id, amount] of Object.entries(subHeadMap)) {
        const record = await SubExpenseHeadOfAccount.findById(id);
        if (record) {
          expenseRecords.push({
            headOfAccount: record.headOfAccount,
            amount: amount.toFixed(2),
          });
          totalExpense += amount;
        }
      }

      const netAmount = totalIncome - totalExpense;
      const total = netAmount - taxation;
      const reserveFund = Math.abs(total * 0.1);
      const afterAppropriation = total - reserveFund;
      const balance = accumulated_surplus_brought_forward + afterAppropriation;

      const calculationRecords = [
        {
          label: "Surplus for the year",
          amount: formatForDisplay(netAmount),
        },
        {
          label: "Taxation",
          amount: `(${taxation.toFixed(2)})`,
        },
        {
          label: "Total",
          amount: formatForDisplay(total),
        },
        {
          label: "Transferred to reserve fund (10%)",
          amount: `(${reserveFund.toFixed(2)})`,
        },
        {
          label: "Surplus for the year after taxation and appropriation",
          amount: formatForDisplay(afterAppropriation),
        },
        {
          label: "Accumulated surplus brought forward",
          amount: formatForDisplay(accumulated_surplus_brought_forward),
        },
        {
          label: "Accumulated surplus transferred to balance sheet",
          amount: formatForDisplay(balance),
        },
      ];

      const rows = [];

      rows.push([`Income Record for Year ${year}`]);
      rows.push(["Start Date", startDate.toLocaleDateString("en-GB")]);
      rows.push(["End Date", endDate.toLocaleDateString("en-GB")]);
      rows.push([]);

      rows.push(["Income", "Amount"]);
      incomeRecords.forEach((r) => rows.push([r.headOfAccount, r.amount]));
      rows.push([]);

      rows.push(["Expense", "Amount"]);
      expenseRecords.forEach((r) => rows.push([r.headOfAccount, r.amount]));
      rows.push([]);

      rows.push(["", "Amount"]);
      calculationRecords.forEach((r) => rows.push([r.label, r.amount]));

      const csvData = generateCsvFromRows(rows);

      const incomeStatement = new IncomeStatement({
        startDate: startDate.toLocaleDateString("en-GB"),
        endDate: endDate.toLocaleDateString("en-GB"),
        reservedFund: reserveFund,
        surplusOfTheYear: afterAppropriation,
      });
      await incomeStatement.save();

      res.header("Content-Type", "text/csv");
      res.attachment(`income-record-${year}.csv`);
      res.send(csvData);
    } catch (error) {
      console.error("CSV generation failed:", error);
      res.status(500).send("Error generating income record CSV");
    }
  },
};
