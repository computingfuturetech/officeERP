const PDFDocument = require("pdfkit");
const fs = require("fs");
const FixedAmount = require("../../models/fixedAmountModel/fixedAmount");
const IncomeStatement = require("../../models/incomeStatementModel/incomeStatement");
const LiabilitiesSchema = require("../../models/incomeModels/libility/libility");
const GeneralLedger = require("../../models/ledgerModels/generalLedger");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const OperatingFixedAssets = require("../../models/operatingFixedAssetsModels/operatingFixedAssets");
const MainExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const CashLedger = require("../../models/ledgerModels/cashBookLedger");
const BankLedger = require("../../models/ledgerModels/bankLedger");

const path = require("path");
const getDynamicGridHtml = require("../../utils/getDynamicGridHtml");
const getDynamicTableHtml = require("../../utils/getDynamicTableHtml");
const generatePdf = require("../../utils/generatePdf");
const balanceSheetTemplatePath = path.join(
  __dirname,
  "../../views/balanceSheetTemplate.html"
);
const _balanceSheetTemplateHtml = fs.readFileSync(
  balanceSheetTemplatePath,
  "utf-8"
);

module.exports = {
  generatePDF: async (req, res) => {
    try {
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
        return res
          .status(400)
          .json({ message: "Year is required." });
      }

      //////////////////////////////////////////////////////////////

      let startDate = new Date(year, 0, 1, 0, 0, 0, 0);
      let endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      if (isNaN(startDate) || isNaN(endDate)) {
        return res
          .status(400)
          .json({ message: "Invalid Year provided" });
      }

      const formattedSDate = startDate
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

      const formattedEDate = endDate
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

      // Share Capital, Reserve Fund, Accumulated Surplus and their Total
      const fixedAmount = await FixedAmount.findOne().exec();
      const shareCapital = fixedAmount?.shareCapital || 0;

      const incomeStatement = await IncomeStatement.findOne({
        startDate: formattedSDate,
        endDate: formattedEDate,
      }).exec();

      let actualReserveFund =
        (incomeStatement?.reservedFund || 0) + reserve_fund;

      let actualAccumulatedSurplus =
        (incomeStatement?.surplusOfTheYear || 0) + accumulated_surplus;

      const totalShareCapitalAndLiabilities =
        shareCapital + actualReserveFund + actualAccumulatedSurplus;

      // Non-Current Liabilities
      const liabilityAccounts = await LiabilitiesSchema.find(
        {},
        "headOfAccount"
      );
      const liabilityAccountIds = liabilityAccounts.map((acc) =>
        acc.headOfAccount.toString()
      );

      const liabilityHeadMap = {};

      liabilityAccountIds.forEach((id) => {
        liabilityHeadMap[id] = 0;
      });

      const ledgerRecords = await GeneralLedger.find({
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        credit: { $gt: 0 },
      });

      if (ledgerRecords.length === 0) {
        return res.status(404).json({
          message: "Cannot create balance sheet because no ledger records found.",
        });
      }

      ledgerRecords.forEach((record) => {
        const { incomeHeadOfAccount, credit } = record;
        const incomeHeadOfAccountStr = incomeHeadOfAccount.toString();

        if (liabilityAccountIds.includes(incomeHeadOfAccountStr)) {
          liabilityHeadMap[incomeHeadOfAccountStr] += credit;
        }
      });

      const aggregatedHeadOfAccountMap = {};

      for (const [id, amount] of Object.entries(liabilityHeadMap)) {
        const nameHeadOfAccount = await IncomeHeadOfAccount.findById(id);
        if (nameHeadOfAccount) {
          const displayName =
            nameHeadOfAccount.headOfAccount === "Bank Profit"
              ? "Return on Deposit"
              : nameHeadOfAccount.headOfAccount;

          if (!aggregatedHeadOfAccountMap[displayName]) {
            aggregatedHeadOfAccountMap[displayName] = 0;
          }
          aggregatedHeadOfAccountMap[displayName] += amount;
        }
      }

      let totalIncome = 0;

      const nonCurrentLiabilitiesRecords = [];
      for (const [displayName, totalAmount] of Object.entries(
        aggregatedHeadOfAccountMap
      )) {
        totalIncome += totalAmount;

        nonCurrentLiabilitiesRecords.push({
          label: displayName,
          amount: formatForDisplay(totalAmount),
        });
      }

      // Current Liabilities - Share Deposit Money, Trade and Other Payable, Position For Taxation and their Total

      const shareMoneyRecords = await GeneralLedger.find({
        headOfAccount: "Share Money",
      }).exec();

      const totalCredit = shareMoneyRecords.reduce(
        (sum, record) => sum + (record.credit || 0),
        0
      );

      const actualShareDepositMoney = totalCredit + share_deposit_money;

      const totalCurrentLiabilities =
        actualShareDepositMoney +
        trade_and_other_payable +
        provision_for_taxation;

      const grandTotalCapitalAndLiabilities =
        totalShareCapitalAndLiabilities + totalIncome + totalCurrentLiabilities;

      // Non-current assets

      const operatingFixedAssets = await OperatingFixedAssets.findOne().exec();
      const totalAmount = operatingFixedAssets
        ? Object.values(operatingFixedAssets.toObject())
            .filter((value) => typeof value === "number")
            .reduce((sum, value) => sum + value, 0)
        : 0;

      const getPurchaseOfLand = await GeneralLedger.find({
        headOfAccount: "Purchase of land",
      }).exec();

      let totalDebitPurchaseOfLand = 0;

      if (getPurchaseOfLand.length > 0) {
        totalDebitPurchaseOfLand = getPurchaseOfLand.reduce(
          (sum, record) => sum + (record.debit || 0),
          0
        );
      } else {
        totalDebitPurchaseOfLand = 0;
      }

      let tpol = totalDebitPurchaseOfLand + purchase_of_land;

      const getDevelopmentExpenditure = await GeneralLedger.find({
        headOfAccount: "Development Expenditure",
      }).exec();

      let totalDevelopmentExpenditure = 0;

      if (getDevelopmentExpenditure.length > 0) {
        totalDevelopmentExpenditure = getDevelopmentExpenditure.reduce(
          (sum, record) => sum + (record.debit || 0),
          0
        );
      } else {
        totalDevelopmentExpenditure = 0;
      }

      let tde = totalDevelopmentExpenditure + cost_of_land_developement;

      let ltsd = long_term_security_deposit;

      const totalNonCurrentAssets =
        totalAmount + intangible_assets + tpol + tde + ltsd;

      // Current assets

      let tlaa = loan_and_advances;

      let cashLedger = await CashLedger.findOne({ date: endDate }).exec();

      if (!cashLedger) {
        cashLedger = await CashLedger.findOne({
          date: { $lt: endDate },
        })
          .sort({ date: -1 })
          .exec();
      }

      let cashbalance = 0;

      if (cashLedger) {
        cashbalance = cashLedger.balance;
      } else {
        console.log("No CashLedger entry found.");
      }

      let bankLedger = await BankLedger.findOne({ date: endDate }).exec();

      if (!bankLedger) {
        bankLedger = await BankLedger.findOne({
          date: { $lt: endDate },
        })
          .sort({ date: -1 })
          .exec();
      }

      let bankBalance = 0;

      if (bankLedger) {
        bankBalance = bankLedger.balance;
      } else {
        console.log("No BankLedger entry found.");
      }

      const totalCurrentAssets = tlaa + cashbalance + bankBalance;

      const grandTotalAssets = totalNonCurrentAssets + totalCurrentAssets;

      //////////////////////////////////////////////////////////////

      const shareCapitalAndLiabilitiesRecords = [];
      shareCapitalAndLiabilitiesRecords.push({
        label: "Share Capital",
        amount: formatForDisplay(shareCapital),
      });
      shareCapitalAndLiabilitiesRecords.push({
        label: "Reserve Fund",
        amount: formatForDisplay(actualReserveFund),
      });
      shareCapitalAndLiabilitiesRecords.push({
        label: "Accumulated Surplus",
        amount: formatForDisplay(actualAccumulatedSurplus),
      });
      shareCapitalAndLiabilitiesRecords.push({
        label: "Total",
        amount: formatForDisplay(totalShareCapitalAndLiabilities),
      });

      nonCurrentLiabilitiesRecords.push({
        label: "Total",
        amount: formatForDisplay(totalIncome),
      });

      const currentLiabilitiesRecords = [];
      currentLiabilitiesRecords.push({
        label: "Share Deposit Money",
        amount: formatForDisplay(actualShareDepositMoney),
      });

      currentLiabilitiesRecords.push({
        label: "Trade and Other Payable",
        amount: formatForDisplay(trade_and_other_payable),
      });

      currentLiabilitiesRecords.push({
        label: "Position For Taxation",
        amount: formatForDisplay(provision_for_taxation),
      });

      currentLiabilitiesRecords.push({
        label: "Total",
        amount: formatForDisplay(totalCurrentLiabilities),
      });

      const capitalAndliabilitiesTotalRecords = [];
      capitalAndliabilitiesTotalRecords.push({
        label: "Grand Total",
        amount: formatForDisplay(grandTotalCapitalAndLiabilities),
      });

      const nonCurrentAssetsRecords = [];
      nonCurrentAssetsRecords.push({
        label: "Operating Fixed Assets",
        amount: formatForDisplay(totalAmount),
      });

      nonCurrentAssetsRecords.push({
        label: "Intangible Assets",
        amount: formatForDisplay(intangible_assets),
      });

      nonCurrentAssetsRecords.push({
        label: "Land at Cost",
        amount: formatForDisplay(tpol),
      });

      nonCurrentAssetsRecords.push({
        label: "Cost of Land Developement",
        amount: formatForDisplay(tde),
      });

      nonCurrentAssetsRecords.push({
        label: "Long Term Security Deposit",
        amount: formatForDisplay(ltsd),
      });

      nonCurrentAssetsRecords.push({
        label: "Total",
        amount: formatForDisplay(totalNonCurrentAssets),
      });

      const currentAssetsRecords = [];
      currentAssetsRecords.push({
        label: "Loan and Advances",
        amount: formatForDisplay(tlaa),
      });

      currentAssetsRecords.push({
        label: "Cash in Hand",
        amount: formatForDisplay(cashbalance),
      });

      currentAssetsRecords.push({
        label: "Bank Balance",
        amount: formatForDisplay(bankBalance),
      });

      currentAssetsRecords.push({
        label: "Total",
        amount: formatForDisplay(totalCurrentAssets),
      });

      const assetsTotalRecords = [];
      assetsTotalRecords.push({
        label: "Grand Total",
        amount: formatForDisplay(grandTotalAssets),
      });

      //////////////////////////////////////////////////////////////

      let balanceSheetTemplateHtml = _balanceSheetTemplateHtml;
      balanceSheetTemplateHtml = balanceSheetTemplateHtml.replace(
        "{{balanceSheetHeading}}",
        "Balance Sheet"
      );

      balanceSheetTemplateHtml = balanceSheetTemplateHtml.replace(
        "{{balanceSheetDetail}}",
        getDynamicGridHtml({
          "START DATE": formattedSDate,
          "END DATE": formattedEDate,
        })
      );

      balanceSheetTemplateHtml = balanceSheetTemplateHtml.replace(
        "{{shareCapitalAndLiabilities}}",
        getDynamicTableHtml({
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
          data: shareCapitalAndLiabilitiesRecords,
        })
      );

      balanceSheetTemplateHtml = balanceSheetTemplateHtml.replace(
        "{{nonCurrentLiabilities}}",
        getDynamicTableHtml({
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
          data: nonCurrentLiabilitiesRecords,
        })
      );

      balanceSheetTemplateHtml = balanceSheetTemplateHtml.replace(
        "{{currentLiabilities}}",
        getDynamicTableHtml({
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
          data: currentLiabilitiesRecords,
        })
      );

      balanceSheetTemplateHtml = balanceSheetTemplateHtml.replace(
        "{{capitalAndliabilitiesTotal}}",
        getDynamicTableHtml({
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
          data: capitalAndliabilitiesTotalRecords,
        })
      );

      balanceSheetTemplateHtml = balanceSheetTemplateHtml.replace(
        "{{nonCurrentAssets}}",
        getDynamicTableHtml({
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
          data: nonCurrentAssetsRecords,
        })
      );

      balanceSheetTemplateHtml = balanceSheetTemplateHtml.replace(
        "{{currentAssets}}",
        getDynamicTableHtml({
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
          data: currentAssetsRecords,
        })
      );

      balanceSheetTemplateHtml = balanceSheetTemplateHtml.replace(
        "{{assetsTotal}}",
        getDynamicTableHtml({
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
          data: assetsTotalRecords,
        })
      );

      //////////////////////////////////////////////////////////////

      const pdfBuffer = await generatePdf(balanceSheetTemplateHtml);

      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Content-Disposition": 'attachment; filename="balance-sheet.pdf"',
      });

      return res.end(pdfBuffer);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

function formatForDisplay(amount) {
  return amount < 0 ? `(${Math.abs(amount).toFixed(2)})` : amount.toFixed(2);
}