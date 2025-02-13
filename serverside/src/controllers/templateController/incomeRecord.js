const PDFDocument = require("pdfkit");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const Income = require("../../models/incomeModels/income/income");
const GeneralLedger = require("../../models/ledgerModels/generalLedger");
const LiabilitiesSchema = require("../../models/incomeModels/libility/libility");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const IncomeStatement = require("../../models/incomeStatementModel/incomeStatement");
const fs = require("fs");
const path = require("path");
const getDynamicGridHtml = require("../../utils/getDynamicGridHtml");
const getDynamicTableHtml = require("../../utils/getDynamicTableHtml");
const generatePdf = require("../../utils/generatePdf");
const incomeRecordTemplatePath = path.join(
  __dirname,
  "../../views/incomeRecordTemplate.html"
);
const _incomeRecordTemplateHtml = fs.readFileSync(
  incomeRecordTemplatePath,
  "utf-8"
);

module.exports = {
  generatePDF: async (req, res) => {
    try {
      let { year, taxation, accumulated_surplus_brought_forward } = req.query;
      taxation = Number(taxation) || 0;
      accumulated_surplus_brought_forward =
        Number(accumulated_surplus_brought_forward) || 0;
      let startDate = new Date(year, 0, 1, 0, 0, 0, 0);
      let endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      if (!year) {
        return res
          .status(400)
          .json({ message: "Year is required." });
      }

      if (isNaN(startDate) || isNaN(endDate)) {
        return res
          .status(400)
          .json({ message: "Invalid Year provided" });
      }

      const liabilityAccounts = await LiabilitiesSchema.find(
        {},
        "headOfAccount"
      );
      const liabilityAccountIds = liabilityAccounts.map((acc) =>
        acc.headOfAccount.toString()
      );

      const ledgerRecords = await GeneralLedger.find({
        ...(!isNaN(startDate) || !isNaN(endDate)
          ? {
              date: {
                ...(!isNaN(startDate)
                  ? {
                      $gte: startDate,
                    }
                  : {}),
                ...(!isNaN(endDate)
                  ? {
                      $lte: endDate,
                    }
                  : {}),
              },
            }
          : {}),
        $or: [{ credit: { $exists: true } }, { debit: { $exists: true } }],
      }).sort({ date: 1 });

      if (ledgerRecords.length === 0) {
        return res.status(404).json({
          message: "Can't create income record beacause no ledger records found.",
        });
      }

      const formattedSDate = startDate
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");
      const formattedEDate = endDate
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

      let totalIncome = 0;
      let totalExpense = 0;

      // ================= Income Section ===================
      const incomeHeadMap = {};
      ledgerRecords.forEach((record) => {
        const { incomeHeadOfAccount, credit } = record;
        if (
          !incomeHeadOfAccount ||
          liabilityAccountIds.includes(incomeHeadOfAccount.toString())
        ) {
          return;
        }
        if (incomeHeadMap[incomeHeadOfAccount]) {
          incomeHeadMap[incomeHeadOfAccount] += credit;
        } else {
          incomeHeadMap[incomeHeadOfAccount] = credit;
        }
      });

      const headOfAccountAmount = Object.keys(incomeHeadMap).map((id) => ({
        id,
        amount: incomeHeadMap[id],
      }));

      // ================= Expense Section ===================
      const mainHeadMap = {};
      const subHeadMap = {};
      ledgerRecords.forEach((record) => {
        const { mainHeadOfAccount, subHeadOfAccount, debit } = record;
        const expenseHeadOfAccount = mainHeadOfAccount || subHeadOfAccount;
        if (
          !expenseHeadOfAccount ||
          liabilityAccountIds.includes(expenseHeadOfAccount.toString())
        ) {
          return;
        }
        if (mainHeadOfAccount) {
          if (mainHeadMap[mainHeadOfAccount]) {
            mainHeadMap[mainHeadOfAccount] += debit;
          } else {
            mainHeadMap[mainHeadOfAccount] = debit;
          }
        }
        if (subHeadOfAccount) {
          if (subHeadMap[subHeadOfAccount]) {
            subHeadMap[subHeadOfAccount] += debit;
          } else {
            subHeadMap[subHeadOfAccount] = debit;
          }
        }
      });

      const mainHeadOfAccountAmount = Object.keys(mainHeadMap).map((id) => ({
        id,
        amount: mainHeadMap[id],
      }));
      const subHeadOfAccountAmount = Object.keys(subHeadMap).map((id) => ({
        id,
        amount: subHeadMap[id],
      }));

      // Income Records
      const incomeRecords = [];

      for (const record of headOfAccountAmount) {
        const nameHeadOfAccount = await IncomeHeadOfAccount.findById(record.id);
        if (nameHeadOfAccount) {
          const displayName =
            nameHeadOfAccount.headOfAccount === "Bank Profit"
              ? "Return on Deposit"
              : nameHeadOfAccount.headOfAccount;

          totalIncome += record.amount;

          incomeRecords.push({
            headOfAccount: displayName,
            amount: record.amount.toFixed(2),
          });
        }
      }

      // Expense Records - Main Head
      const expenseRecords = [];

      for (const record of mainHeadOfAccountAmount) {
        const nameHeadOfAccount = await MainHeadOfAccount.findById(record.id);
        if (nameHeadOfAccount) {
          totalExpense += record.amount;

          const displayName = nameHeadOfAccount.headOfAccount;

          expenseRecords.push({
            headOfAccount: displayName,
            amount: record.amount.toFixed(2),
          });
        }
      }

      // Expense Records - Sub Head
      for (const record of subHeadOfAccountAmount) {
        const nameHeadOfAccount = await SubExpenseHeadOfAccount.findById(
          record.id
        );
        if (nameHeadOfAccount) {
          totalExpense += record.amount;

          const displayName = nameHeadOfAccount.headOfAccount;

          expenseRecords.push({
            headOfAccount: displayName,
            amount: record.amount.toFixed(2),
          });
        }
      }

      const netAmount = totalIncome - totalExpense;
      const total = netAmount - taxation;
      const revervePercentage = 0.1;
      const reserveFund = Math.abs(total * revervePercentage);
      const after_appropriation = total - reserveFund;
      const balance = accumulated_surplus_brought_forward + after_appropriation;

      const calculationRecords = [];

      calculationRecords.push({
        label: "Surplus for the year",
        amount: formatForDisplay(netAmount),
      });
      calculationRecords.push({
        label: "Taxation",
        amount: `(${taxation.toFixed(2)})`,
      });
      calculationRecords.push({
        label: "Total",
        amount: formatForDisplay(total),
      });
      calculationRecords.push({
        label: "Transferred to reserve fund (10%)",
        amount: `(${reserveFund.toFixed(2)})`,
      });
      calculationRecords.push({
        label: "Surplus for the year after taxation and appropriation",
        amount: formatForDisplay(after_appropriation),
      });
      calculationRecords.push({
        label: "Accumulated surplus brought forward",
        amount: formatForDisplay(accumulated_surplus_brought_forward),
      });
      calculationRecords.push({
        label: "Accumulated surplus transferred to balance sheet",
        amount: formatForDisplay(balance),
      });

      let incomeRecordTemplateHtml = _incomeRecordTemplateHtml;
      incomeRecordTemplateHtml = incomeRecordTemplateHtml.replace(
        "{{incomeRecordHeading}}",
        "Income Record"
      );
      incomeRecordTemplateHtml = incomeRecordTemplateHtml.replace(
        "{{incomeRecordDetail}}",
        getDynamicGridHtml({
          "START DATE": formattedSDate,
          "END DATE": formattedEDate,
        })
      );

      let incomeRecordTablesHtml = "";
      incomeRecordTablesHtml = incomeRecordTablesHtml += getDynamicTableHtml({
        columns: [
          {
            label: "Income",
            key: "headOfAccount",
          },
          {
            label: "Amount",
            key: "amount",
          },
        ],
        data: incomeRecords,
      });

      incomeRecordTablesHtml = incomeRecordTablesHtml += getDynamicTableHtml({
        columns: [
          {
            label: "Expense",
            key: "headOfAccount",
          },
          {
            label: "Amount",
            key: "amount",
          },
        ],
        data: expenseRecords,
      });

      incomeRecordTablesHtml = incomeRecordTablesHtml += getDynamicTableHtml({
        columns: [
          {
            label: "",
            key: "label",
          },
          {
            label: "Amount",
            key: "amount",
          },
        ],
        data: calculationRecords,
      });

      incomeRecordTemplateHtml = incomeRecordTemplateHtml.replace(
        "{{incomeRecordTables}}",
        incomeRecordTablesHtml
      );

      const pdfBuffer = await generatePdf(incomeRecordTemplateHtml);

      const incomeStatement = new IncomeStatement({
        startDate: formattedSDate,
        endDate: formattedEDate,
        reservedFund: reserveFund || 0,
        surplusOfTheYear: after_appropriation || 0,
      });

      await incomeStatement.save();

      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Content-Disposition": 'attachment; filename="income-record.pdf"',
      });
      return res.end(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Failed to generate PDF");
    }
  },
};

function formatForDisplay(amount) {
  return amount < 0 ? `(${Math.abs(amount).toFixed(2)})` : amount.toFixed(2);
}
