const { stat } = require("fs");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const TypesOfHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/typeOfHeadOfAccount");

module.exports = {
  createHeadOfAccount: async (req, res) => {
    const { headOfAccount, type } = req.body;

    try {
      if (!headOfAccount) {
        return res.status(400).json({
          status: "error",
          message: "Head of Account are required",
        });
      }

      if (typeof headOfAccount !== "string" || headOfAccount.trim() === "") {
        return res.status(400).json({
          status: "error",
          message: "Head of Account must be a non-empty string",
        });
      }

      const headOfAccountArray = headOfAccount
        .split(",")
        .map((value) => value.trim());

      const incomeType = await TypesOfHeadOfAccount.findOne({
        type: type,
      }).exec();

      const promises = headOfAccountArray.map(async (headOfAccountValue) => {
        const incomeHeadOfAccount = incomeType
          ? new IncomeHeadOfAccount({
              headOfAccount: headOfAccountValue,
              type: type ? incomeType._id : null,
            })
          : new IncomeHeadOfAccount({
              headOfAccount: headOfAccountValue,
            });
        return incomeHeadOfAccount.save();
      });

      const createdIncomeHeadOfAccounts = await Promise.all(promises);

      res.status(201).json({
        status: "success",
        message: "Head of Account created successfully",
        data: createdIncomeHeadOfAccounts,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  updateHeadOfAccount: async (req, res) => {
    const { headOfAccount, type } = req.body;
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }
      const incomeHeadOfAccount = await IncomeHeadOfAccount.findById(id).exec();
      if (!incomeHeadOfAccount) {
        return res.status(404).json({
          status: "error",
          message: "Head Of Account not found",
        });
      }
      const updateData = {};
      if (headOfAccount) {
        updateData.headOfAccount = headOfAccount;
      }
      if (type) {
        updateData.incomeType = type;
      }
      const updatedIncomeHeadOfAccount =
        await IncomeHeadOfAccount.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Head Of Account updated successfully",
        data: updatedIncomeHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  listOfHeadOfAccount: async (req, res) => {
    try {
      const { type } = req.query;
      const incomeType = await TypesOfHeadOfAccount.findOne({
        type: type,
      }).exec();

      let headOfAccount = await IncomeHeadOfAccount.find()
        .populate("type")
        .exec();

      if (type) {
        headOfAccount = await IncomeHeadOfAccount.find({
          type: incomeType._id,
        })
          .populate("type")
          .exec();
      }
      return res.status(200).json({
        status: "success",
        message: "List of Head Of Account",
        data: headOfAccount,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
