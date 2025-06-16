const FixedAmount = require("../../models/fixedAmountModel/fixedAmount");
const IncomeStatement = require("../../models/incomeStatementModel/incomeStatement");
const LiabilitiesSchema = require("../../models/incomeModels/libility/libility");
const GeneralLedger = require("../../models/ledgerModels/generalLedger");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const OperatingFixedAssets = require("../../models/operatingFixedAssetsModels/operatingFixedAssets");
const CashLedger = require("../../models/ledgerModels/cashBookLedger");
const BankLedger = require("../../models/ledgerModels/bankLedger");
const generateCsv = require("../../utils/generateCsv"); // assuming it exists

module.exports = {
  generateCSV: async (req, res) => {
    try {
      // Same input parsing and logic from generatePDF
      let {
        year,
        reserve_fund,
        accumulated_surplus,
        share_deposit_money,
        trade_and_other_payable,
        provision_for_taxation,
        intangible_assets,
        purchase_of_land,
        cost_of_land_developement,
        long_term_security_deposit,
        loan_and_advances,
      } = req.query;

      reserve_fund = Number(reserve_fund) || 0;
      accumulated_surplus = Number(accumulated_surplus) || 0;
      share_deposit_money = Number(share_deposit_money) || 0;
      trade_and_other_payable = Number(trade_and_other_payable) || 0;
      provision_for_taxation = Number(provision_for_taxation) || 0;
      intangible_assets = Number(intangible_assets) || 0;
      purchase_of_land = Number(purchase_of_land) || 0;
      cost_of_land_developement = Number(cost_of_land_developement) || 0;
      long_term_security_deposit = Number(long_term_security_deposit) || 0;
      loan_and_advances = Number(loan_and_advances) || 0;

      if (!year) {
        return res.status(400).json({ message: "Year is required." });
      }

      let startDate = new Date(year, 0, 1);
      let endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      const formattedSDate = startDate
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");
      const formattedEDate = endDate
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

      const fixedAmount = await FixedAmount.findOne().exec();
      const shareCapital = fixedAmount?.shareCapital || 0;

      const incomeStatement = await IncomeStatement.findOne({
        startDate: formattedSDate,
        endDate: formattedEDate,
      });

      let actualReserveFund =
        (incomeStatement?.reservedFund || 0) + reserve_fund;
      let actualAccumulatedSurplus =
        (incomeStatement?.surplusOfTheYear || 0) + accumulated_surplus;
      const totalShareCapitalAndLiabilities =
        shareCapital + actualReserveFund + actualAccumulatedSurplus;

      const liabilityAccounts = await LiabilitiesSchema.find(
        {},
        "headOfAccount"
      );
      const liabilityAccountIds = liabilityAccounts.map((acc) =>
        acc.headOfAccount.toString()
      );
      const liabilityHeadMap = Object.fromEntries(
        liabilityAccountIds.map((id) => [id, 0])
      );

      const ledgerRecords = await GeneralLedger.find({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        credit: { $gt: 0 },
      });

      ledgerRecords.forEach(({ incomeHeadOfAccount, credit }) => {
        const id = incomeHeadOfAccount?.toString();
        if (liabilityAccountIds.includes(id)) {
          liabilityHeadMap[id] += credit;
        }
      });

      const aggregatedHeadOfAccountMap = {};
      for (const [id, amount] of Object.entries(liabilityHeadMap)) {
        const acc = await IncomeHeadOfAccount.findById(id);
        if (acc) {
          const name =
            acc.headOfAccount === "Bank Profit"
              ? "Return on Deposit"
              : acc.headOfAccount;
          aggregatedHeadOfAccountMap[name] =
            (aggregatedHeadOfAccountMap[name] || 0) + amount;
        }
      }

      const nonCurrentLiabilitiesRecords = Object.entries(
        aggregatedHeadOfAccountMap
      ).map(([label, amount]) => ({
        Section: "Non-Current Liabilities",
        Label: label,
        Amount: formatForDisplay(amount),
      }));

      const shareMoneyRecords = await GeneralLedger.find({
        headOfAccount: "Share Money",
      });
      const totalCredit = shareMoneyRecords.reduce(
        (sum, { credit }) => sum + (credit || 0),
        0
      );
      const actualShareDepositMoney = totalCredit + share_deposit_money;
      const totalCurrentLiabilities =
        actualShareDepositMoney +
        trade_and_other_payable +
        provision_for_taxation;
      const totalIncome = Object.values(aggregatedHeadOfAccountMap).reduce(
        (sum, val) => sum + val,
        0
      );
      const grandTotalCapitalAndLiabilities =
        totalShareCapitalAndLiabilities + totalIncome + totalCurrentLiabilities;

      const getValueFromGL = async (head) => {
        const records = await GeneralLedger.find({ headOfAccount: head });
        return records.reduce((sum, { debit }) => sum + (debit || 0), 0);
      };

      const totalAmount = (await OperatingFixedAssets.findOne())
        ? Object.values((await OperatingFixedAssets.findOne()).toObject())
            .filter((val) => typeof val === "number")
            .reduce((sum, val) => sum + val, 0)
        : 0;

      const tpol =
        (await getValueFromGL("Purchase of land")) + purchase_of_land;
      const tde =
        (await getValueFromGL("Development Expenditure")) +
        cost_of_land_developement;
      const totalNonCurrentAssets =
        totalAmount +
        intangible_assets +
        tpol +
        tde +
        long_term_security_deposit;
      const cashLedger = await CashLedger.findOne({
        date: { $lte: endDate },
      }).sort({ date: -1 });
      const bankLedger = await BankLedger.findOne({
        date: { $lte: endDate },
      }).sort({ date: -1 });
      const totalCurrentAssets =
        loan_and_advances +
        (cashLedger?.balance || 0) +
        (bankLedger?.balance || 0);
      const grandTotalAssets = totalNonCurrentAssets + totalCurrentAssets;

      // Now structure the data for CSV
      const rows = [
        {
          Section: "Balance Sheet",
          Label: "Start Date",
          Amount: formattedSDate,
        },
        { Section: "Balance Sheet", Label: "End Date", Amount: formattedEDate },
        {
          Section: "Share Capital & Reserves",
          Label: "Share Capital",
          Amount: formatForDisplay(shareCapital),
        },
        {
          Section: "Share Capital & Reserves",
          Label: "Reserve Fund",
          Amount: formatForDisplay(actualReserveFund),
        },
        {
          Section: "Share Capital & Reserves",
          Label: "Accumulated Surplus",
          Amount: formatForDisplay(actualAccumulatedSurplus),
        },
        {
          Section: "Share Capital & Reserves",
          Label: "Total",
          Amount: formatForDisplay(totalShareCapitalAndLiabilities),
        },
        ...nonCurrentLiabilitiesRecords,
        {
          Section: "Non-Current Liabilities",
          Label: "Total",
          Amount: formatForDisplay(totalIncome),
        },
        {
          Section: "Current Liabilities",
          Label: "Share Deposit Money",
          Amount: formatForDisplay(actualShareDepositMoney),
        },
        {
          Section: "Current Liabilities",
          Label: "Trade and Other Payable",
          Amount: formatForDisplay(trade_and_other_payable),
        },
        {
          Section: "Current Liabilities",
          Label: "Provision for Taxation",
          Amount: formatForDisplay(provision_for_taxation),
        },
        {
          Section: "Current Liabilities",
          Label: "Total",
          Amount: formatForDisplay(totalCurrentLiabilities),
        },
        {
          Section: "Capital & Liabilities Total",
          Label: "Grand Total",
          Amount: formatForDisplay(grandTotalCapitalAndLiabilities),
        },
        {
          Section: "Non-Current Assets",
          Label: "Operating Fixed Assets",
          Amount: formatForDisplay(totalAmount),
        },
        {
          Section: "Non-Current Assets",
          Label: "Intangible Assets",
          Amount: formatForDisplay(intangible_assets),
        },
        {
          Section: "Non-Current Assets",
          Label: "Land at Cost",
          Amount: formatForDisplay(tpol),
        },
        {
          Section: "Non-Current Assets",
          Label: "Cost of Land Development",
          Amount: formatForDisplay(tde),
        },
        {
          Section: "Non-Current Assets",
          Label: "Long Term Security Deposit",
          Amount: formatForDisplay(long_term_security_deposit),
        },
        {
          Section: "Non-Current Assets",
          Label: "Total",
          Amount: formatForDisplay(totalNonCurrentAssets),
        },
        {
          Section: "Current Assets",
          Label: "Loan and Advances",
          Amount: formatForDisplay(loan_and_advances),
        },
        {
          Section: "Current Assets",
          Label: "Cash in Hand",
          Amount: formatForDisplay(cashLedger?.balance || 0),
        },
        {
          Section: "Current Assets",
          Label: "Bank Balance",
          Amount: formatForDisplay(bankLedger?.balance || 0),
        },
        {
          Section: "Current Assets",
          Label: "Total",
          Amount: formatForDisplay(totalCurrentAssets),
        },
        {
          Section: "Assets Total",
          Label: "Grand Total",
          Amount: formatForDisplay(grandTotalAssets),
        },
      ];

      const csv = await generateCsv(
        ["Section", "Label", "Amount"],
        {
          Section: "Section",
          Label: "Label",
          Amount: "Amount",
        },
        rows
      );

      res.header("Content-Type", "text/csv");
      res.attachment("balance-sheet.csv");
      res.send(csv);
    } catch (error) {
      console.error("Error generating CSV:", error);
      res.status(500).json({ message: "Failed to generate CSV" });
    }
  },
};

function formatForDisplay(amount) {
  return amount < 0 ? `(${Math.abs(amount).toFixed(2)})` : amount.toFixed(2);
}
