const MainExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");

const subExpenseData = {
  "Utility Office": ["Lesco", "Telephone", "Water", "Gas"],
  "Legal/Profit": [
    "Legal",
    "Tax Consultant",
    "IT Billing",
    "Account and Consultant",
  ],
  "Miscellaneous Office": ["TA/DA", "Misc"],

  "Lesco Site": ["D Block", "A Block"],
  "Repair/Maintenance": ["Phase 1", "Phase 2"],
  "Disposal/Vehicle Expense": ["Disposal", "Vehicle"],
  "Electricity/Water Connection": ["Electricity", "Water Connection"],
  Miscellaneous: ["Dengue", "Weapon", "Demarcation"],
};

module.exports = {
  createSubExpenseHeadOfAccount: async (req, res) => {
    try {
      for (const [mainHead, subHeads] of Object.entries(subExpenseData)) {
        const mainHeadDoc = await MainExpenseHeadOfAccount.findOne({
          headOfAccount: mainHead,
        });

        if (!mainHeadDoc) {
          console.warn(`⚠️ Main Head "${mainHead}" not found. Skipping...`);
          continue;
        }

        // Check existing sub-heads under this main head
        const existingSubHeads = await SubExpenseHeadOfAccount.find({
          headOfAccount: { $in: subHeads },
          mainHeadOfAccount: mainHeadDoc._id,
        });

        const existingSubHeadNames = existingSubHeads.map(
          (sh) => sh.headOfAccount
        );

        // Filter new sub-heads that don't exist yet
        const newSubHeads = subHeads
          .filter((sh) => !existingSubHeadNames.includes(sh))
          .map((sh) => ({
            headOfAccount: sh,
            mainHeadOfAccount: mainHeadDoc._id,
          }));

        // Insert new sub-heads if any
        if (newSubHeads.length > 0) {
          const insertedSubHeads = await SubExpenseHeadOfAccount.insertMany(
            newSubHeads
          );

          // Extract newly inserted sub-head IDs
          const subHeadIds = insertedSubHeads.map((sh) => sh._id);

          // Update main expense head with new sub-head IDs
          await MainExpenseHeadOfAccount.findByIdAndUpdate(mainHeadDoc._id, {
            $push: { subExpenseHeads: { $each: subHeadIds } },
          });

          console.log(
            `✅ Sub-Expense Heads added for "${mainHead}":`,
            insertedSubHeads
          );
        } else {
          console.log(
            `ℹ️ All sub-expense heads already exist for "${mainHead}".`
          );
        }
      }

      return res.status(201).json({
        status: "success",
        message: "Sub-expense heads created and linked successfully!",
      });
    } catch (err) {
      console.error("❌ Error creating sub-expense heads:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  },
};
