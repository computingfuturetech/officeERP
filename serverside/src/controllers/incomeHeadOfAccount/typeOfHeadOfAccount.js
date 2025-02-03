const TypesOfHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/typeOfHeadOfAccount");

module.exports = {
  createTypeOfHeadOfAccount: async (req, res) => {
    const { type } = req.body;

    try {
      if (!type) {
        return res.status(400).json({
          status: "error",
          message: "Type is required",
        });
      }

      const typeOfHeadOfAccount = new TypesOfHeadOfAccount({
        type: type,
      });
      typeOfHeadOfAccount.save();

      res.status(201).json({
        status: "success",
        message: "Type created successfully",
        data: typeOfHeadOfAccount,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
};
