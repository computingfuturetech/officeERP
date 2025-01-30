const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");

module.exports = {
  createMainHeadOfAccount: async (req, res) => {
    const { headOfAccount, expenseType } = req.body;
    try {
      if (!headOfAccount || !expenseType) {
        return res.status(400).json({
          status: "error",
          message: "Head of Account id required",
        });
      }
      const mainHeadOfAccount = new MainHeadOfAccount({
        headOfAccount: headOfAccount,
        expenseType: expenseType,
      });
      await mainHeadOfAccount.save();
      res.status(201).json({
        status: "success",
        message: "Head of Account created successfully",
        data: mainHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateMainHeadOfAccount: async (req, res) => {
    const { headOfAccount } = req.body;
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }
      const mainHeadOfAccount = await MainHeadOfAccount.findById(id).exec();
      if (!mainHeadOfAccount) {
        return res.status(404).json({
          status: "error",
          message: "Main Head Of Account not found",
        });
      }
      const updateData = {};
      if (headOfAccount) {
        updateData.headOfAccount = headOfAccount;
      }
      const updatedMainExpenseHeadOfAccount =
        await MainHeadOfAccount.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Main Head Of Account updated successfully",
        data: updatedMainExpenseHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  createSubHeadOfAccount: async (req, res) => {
    const { headOfAccount, mainHeadOfAccount } = req.body;
    try {
      if (!headOfAccount || !mainHeadOfAccount) {
        return res.status(400).json({
          status: "error",
          message: "All fields are required",
        });
      }

      const mainHeadOfAccountFound = await MainHeadOfAccount.findById(
        mainHeadOfAccount
      ).exec();
      if (!mainHeadOfAccountFound) {
        return res.status(404).json({
          status: "error",
          message: "Main Head of account not found",
        });
      }

      const headOfAccountArray = headOfAccount
        .split(",")
        .map((value) => value.trim());

      const promises = headOfAccountArray.map((headOfAccountValue) => {
        const subHeadOfAccount = new SubExpenseHeadOfAccount({
          headOfAccount: headOfAccountValue,
          mainHeadOfAccount: mainHeadOfAccount,
        });
        return subHeadOfAccount.save();
      });

      const subExpenseHeads = await Promise.all(promises);
      const subExpenseHeadIds = subExpenseHeads.map((head) => head._id);

      const saveMainHeadOfAccount = await MainHeadOfAccount.findByIdAndUpdate(
        mainHeadOfAccount,
        {
          $addToSet: {
            subExpenseHeads: subExpenseHeadIds,
          },
        }
      );

      await Promise.all(promises);
      res.status(200).json({
        status: "success",
        message: "Sub HeadOfAccount created successfully",
        data: saveMainHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateSubHeadOfAccount: async (req, res) => {
    const { headOfAccount } = req.body;
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }
      const subHeadOfAccount = await SubExpenseHeadOfAccount.findById(
        id
      ).exec();
      if (!subHeadOfAccount) {
        return res.status(404).json({
          status: "error",
          message: "Sub Head Of Account not found",
        });
      }
      const updateData = {};
      if (headOfAccount) {
        updateData.headOfAccount = headOfAccount;
      }
      const updatedSubExpenseHeadOfAccount =
        await SubExpenseHeadOfAccount.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Sub Head Of Account updated successfully",
        data: updatedSubExpenseHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  listOfHeadOfAccount: async (req, res) => {
    try {
      const { expenseType } = req.query;
      const filter = expenseType ? { expenseType } : {};

      const headOfAccount = await MainHeadOfAccount.find(filter).populate(
        "subExpenseHeads"
      );

      if (!headOfAccount.length) {
        return res.status(404).json({
          status: "error",
          message: "No Head of Account found",
          data: [],
        });
      }

      return res.status(200).json({
        status: "success",
        message: "List of Head of Account",
        data: headOfAccount,
      });
    } catch (err) {
      console.error("Error fetching Head of Account:", err);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: err.message,
      });
    }
  },
};
