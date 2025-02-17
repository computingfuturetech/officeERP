const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const TypesOfHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/typeOfHeadOfAccount");

const incomeHeadsData = {
  Seller: [
    "NOC Fee",
    "Masjid Fund",
    "Dual Owner Fee",
    "Covered Area Fee",
    "Share Money",
    "Deposit For Land Cost",
    "Deposit For Development Charges",
    "Additional Development Charges",
    "Electricity Charges",
  ],
  Purchaser: [
    "Transfer Fee",
    "Membership Fee",
    "Admission Fee",
    "Preference Fee",
    "Masjid Fund",
  ],
  "Possession Heads": [
    "Possession Fee",
    "Construction Water",
    "Electricity charges",
    "Water Charges",
    "Building Bylaws Charges",
    "Masjid Fund",
  ],
  "Bank Profit": ["Bank Profit"],
  "Water/Maintenance Bill": ["Water/Maintenance Bill"],
};

module.exports = {
  createIncomeHeadOfAccount: async (req, res) => {
    try {
      const types = await TypesOfHeadOfAccount.find({
        type: { $in: Object.keys(incomeHeadsData) },
      });

      if (!types.length) {
        return res.status(400).json({
          status: "error",
          message:
            "No predefined types found. Make sure to create types first!",
        });
      }

      const typeMap = types.reduce((acc, type) => {
        acc[type.type] = type._id;
        return acc;
      }, {});

      const incomeHeadDocs = [];
      for (const [typeName, headOfAccounts] of Object.entries(
        incomeHeadsData
      )) {
        if (typeMap[typeName]) {
          headOfAccounts.forEach((head) => {
            incomeHeadDocs.push({
              headOfAccount: head,
              type: typeMap[typeName],
            });
          });
        }
      }

      await IncomeHeadOfAccount.insertMany(incomeHeadDocs);

      return res.status(201).json({
        status: "success",
        message: "Income Heads Created Successfully!",
      });
    } catch (err) {
      console.error("❌ Error inserting Income Heads:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  },
};
