const BankProfit = require("../../models/incomeModels/bankProfitModels/bankProfit");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const PossessionFee = require("../../models/incomeModels/pssessionFeeModel/possessionFee");
const SellerPurchaseIncome = require("../../models/incomeModels/sellerPurchaseIncome/sellerPurchaseIncome");
const WaterMaintenancBill = require("../../models/incomeModels/waterMaintenanceBillModel/waterMaintenanceBill");

module.exports = {
    getAllIncome: async (req, res) => {
        try {
          const incomeHeadOfAccounts = await IncomeHeadOfAccount.find().exec();
          if (!incomeHeadOfAccounts) {
            res.status(404).json({ message: 'Income head of account not found' });
          }
      
          const query = {
            $or: [
              { headOfAccount: { $in: incomeHeadOfAccounts } },
            ]
          };
      
          const incomePromises = [
            BankProfit.find(query, 'headOfAccount amount paidDate').populate("headOfAccount", "headOfAccount"),
            PossessionFee.find(query, 'headOfAccount amount paidDate').populate("headOfAccount", "headOfAccount"),
            SellerPurchaseIncome.find(query, 'headOfAccount amount paidDate').populate("headOfAccount", "headOfAccount"),
            WaterMaintenancBill.find(query, 'headOfAccount amount paidDate').populate("headOfAccount", "headOfAccount"),
          ];
      
          const combinedincomes = (await Promise.all(incomePromises)).flat();
      
          if (combinedincomes.length === 0) {
            res.status(404).json({ message: "No incomes found for the given income type" });
          }
      
          res.status(200).json(combinedincomes);
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      },
      getIncomeByHeadOfAccount: async (req, res) => {
        const { headOfAccountId, mainId } = req.query;
      
        if (!headOfAccountId || !mainId) {
          return res.status(400).json({ message: "Head of Account ID and Main ID are required" });
        }
      
        try {
          const query = {
            $or: [
              { headOfAccount: headOfAccountId, _id: mainId },
            ]
          };
      
          const incomes = await Promise.all([
            BankProfit.findOne(query).populate("headOfAccount", "headOfAccount"),
            PossessionFee.findOne(query).populate("headOfAccount", "headOfAccount"),
            SellerPurchaseIncome.findOne(query).populate("headOfAccount", "headOfAccount"),
            WaterMaintenancBill.findOne(query).populate("headOfAccount", "headOfAccount"),
          ]);
      
          const income = incomes.find(result => result !== null);
      
          if (!income) {
            return res.status(404).json({ message: "No income found for the given head of account ID and main ID" });
          }
      
          res.status(200).json(income);
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      },
};