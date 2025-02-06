const VehicleDisposalExpense = require("../../models/expenseModel/vehicleDisposalExpense/vehicleDisposalExpense");
const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const CheckMainAndSubHeadOfAccount = require("../../middleware/checkMainAndSubHeadOfAccount");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");
const VoucherNo = require("../../middleware/generateVoucherNo");
const CashBookLedger = require("../../middleware/createCashBookLedger");
const headOfAccount = require("../expenseHeadOfAccountController/headOfAccount");

module.exports = {
  createVehicleDisposalExpense: async (req, res) => {
    const {
      mainHeadOfAccount,
      subHeadOfAccount,
      amount,
      fuelLitre,
      vehicleNumber,
      paidDate,
      vehicleType,
      particular,
    } = req.body;

    try {
      if (!paidDate) {
        return res.status(400).json({
          status: "error",
          message: "Paid Date is required",
        });
      }

      if (!fuelLitre) {
        return res.status(400).json({
          status: "error",
          message: "Fuel Litre is required",
        });
      }

      if (!amount) {
        return res.status(400).json({
          status: "error",
          message: "Amount is required",
        });
      }

      const vehicleDisposalExpense = new VehicleDisposalExpense({
        paidDate: paidDate,
        mainHeadOfAccount: mainHeadOfAccount,
        subHeadOfAccount: subHeadOfAccount,
        amount: amount,
        fuelLitre: fuelLitre,
        vehicleNumber: vehicleNumber,
        vehicleType: vehicleType,
        particular: particular,
      });

      let headOfAccount = subHeadOfAccount
        ? subHeadOfAccount
        : mainHeadOfAccount;

      const update_id = vehicleDisposalExpense._id;

      const type = "expense";

      const cashVoucherNo = await VoucherNo.generateCashVoucherNo(
        req,
        res,
        type
      );
      await CashBookLedger.createCashBookLedger(
        req,
        res,
        cashVoucherNo,
        type,
        headOfAccount,
        particular,
        amount,
        paidDate,
        update_id
      );
      await GeneralLedger.createGeneralLedger(
        req,
        res,
        cashVoucherNo,
        type,
        headOfAccount,
        particular,
        amount,
        paidDate,
        null,
        null,
        update_id,
        null
      );

      await vehicleDisposalExpense.save();
      res.status(201).json({
        status: "success",
        message: "Vehicle Disposal Expense created successfully",
        data: vehicleDisposalExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateVehicleDisposalExpense: async (req, res) => {
    const { id } = req.query;
    const {
      amount,
      fuelLitre,
      vehicleNumber,
      paidDate,
      vehicleType,
      particular,
    } = req.body;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }

      const vehicleDisposalExpense = await VehicleDisposalExpense.findById(
        id
      ).exec();
      if (!vehicleDisposalExpense) {
        return res.status(404).json({
          status: "error",
          message: "Vehicle Disposal Expense not found",
        });
      }

      const updateData = {};
      if (paidDate) {
        updateData.paidDate = paidDate;
      }
      if (amount) {
        updateData.amount = amount;
      }
      if (fuelLitre) {
        updateData.fuelLitre = fuelLitre;
      }
      if (vehicleNumber) {
        updateData.vehicleNumber = vehicleNumber;
      }
      if (vehicleType) {
        updateData.vehicleType = vehicleType;
      }
      if (particular) {
        updateData.particular = particular;
      }

      const type = "expense";

      await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
      await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);

      const updatedVehicleDisposalExpense =
        await VehicleDisposalExpense.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Vehicle Disposal updated successfully",
        data: updatedVehicleDisposalExpense,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getVehicleDisposalExpense: async (req, res) => {
    const { head_of_account } = req.query;
    try {
      let query = {};

      if (head_of_account) {
        const mainHeadOfAccount = await MainHeadOfAccount.findOne({
          headOfAccount: head_of_account,
        }).exec();
        const subHeadOfAccount = await SubExpenseHeadOfAccount.findOne({
          headOfAccount: head_of_account,
        }).exec();

        if (mainHeadOfAccount) {
          query.mainHeadOfAccount = mainHeadOfAccount._id;
        } else if (subHeadOfAccount) {
          query.subHeadOfAccount = subHeadOfAccount._id;
        } else {
          return res.status(404).json({ message: "Head of Account not found" });
        }
      }

      const vehicleDisposalExpenses = await VehicleDisposalExpense.find(query)
        .populate("mainHeadOfAccount", "headOfAccount")
        .populate("subHeadOfAccount", "headOfAccount")
        .exec();

      if (vehicleDisposalExpenses.length === 0) {
        return res
          .status(404)
          .json({ message: "Vehicle Disposal Expense not found" });
      }

      res.status(200).json(vehicleDisposalExpenses);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
