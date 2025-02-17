const MainExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");

const officeExpenseHeads = [
  "Salaries Office Employees",
  "Utility Office",
  "Printing And Stationary",
  "Newspaper",
  "Advertisement",
  "Legal/Profit",
  "Audit",
  "Entertainment",
  "Office Repair/Maintenance",
  "Bank Charges",
  "Miscellaneous Office",
  "Rent Rate/Taxes",
];

const siteExpenseHeads = [
  "Salaries Site Employees",
  "Lesco Site",
  "Repair/Maintenance",
  "Disposal/Vehicle Expense",
  "Electricity/Water Connection",
  "Miscellaneous",
  "Purchase of Land",
  "Development Expenditure",
];

module.exports = {
  createMainOfficeExpenseHeadOfAccount: async (req, res) => {
    try {
      // Check for existing entries
      const existingHeads = await MainExpenseHeadOfAccount.find({
        headOfAccount: { $in: officeExpenseHeads },
        expenseType: "Office Expense",
      });

      const existingHeadNames = existingHeads.map((head) => head.headOfAccount);

      // Filter out already existing heads
      const newHeads = officeExpenseHeads
        .filter((head) => !existingHeadNames.includes(head))
        .map((head) => ({
          headOfAccount: head,
          expenseType: "Office Expense",
        }));

      if (newHeads.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "All Office Expense Heads already exist.",
        });
      }

      await MainExpenseHeadOfAccount.insertMany(newHeads);

      return res.status(201).json({
        status: "success",
        message: "Office Expense Heads Created Successfully!",
      });
    } catch (err) {
      console.error("❌ Error inserting Office Expense Heads:", err);
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  },
  createMainSiteExpenseHeadOfAccount: async (req, res) => {
    try {
      // Check for existing entries
      const existingHeads = await MainExpenseHeadOfAccount.find({
        headOfAccount: { $in: siteExpenseHeads },
        expenseType: "Site Expense",
      });

      const existingHeadNames = existingHeads.map((head) => head.headOfAccount);

      // Filter out already existing heads
      const newHeads = siteExpenseHeads
        .filter((head) => !existingHeadNames.includes(head))
        .map((head) => ({
          headOfAccount: head,
          expenseType: "Site Expense",
        }));

      if (newHeads.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "All Site Expense Heads already exist.",
        });
      }

      await MainExpenseHeadOfAccount.insertMany(newHeads);

      return res.status(201).json({
        status: "success",
        message: "Site Expense Heads Created Successfully!",
      });
    } catch (err) {
      console.error("❌ Error inserting Site Expense Heads:", err);
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    }
  },
};
