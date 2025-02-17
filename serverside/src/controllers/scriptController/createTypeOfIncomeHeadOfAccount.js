const TypesOfHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/typeOfHeadOfAccount");

module.exports = {
  createPredefinedTypes: async (req, res) => {
    const predefinedTypes = [
      "Seller",
      "Purchaser",
      "Possession Heads",
      "Bank Profit",
      "Water/Maintenance Bill",
    ];

    try {
      // Insert all predefined types
      const insertedTypes = await TypesOfHeadOfAccount.insertMany(
        predefinedTypes.map((type) => ({ type }))
      );

      res.status(201).json({
        status: "success",
        message: "Predefined types created successfully",
        data: insertedTypes,
      });
    } catch (err) {
      console.error("Error inserting predefined types:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to insert predefined types",
        error: err.message,
      });
    }
  },
};
