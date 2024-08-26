const Liability = require('../../models/incomeModels/libility/libility');
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");

module.exports = {
    createLiability: async (req, res) => {
      const { id } = req.body;
      try {
        if (!id) {
          return res.status(400).json({ message: "Id is required" });
        }
        const createLiability = new Liability({
          headOfAccount: id,
        });
  
        await createLiability.save();
        res.status(201).json({
          message: "Liability created successfully",
          data: createLiability,
        });
        res.status(200).json();

      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  };
