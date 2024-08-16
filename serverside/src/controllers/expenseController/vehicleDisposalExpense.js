const VehicleDisposalExpense = require("../../models/expenseModel/vehicleDisposalExpense/vehicleDisposalExpense");
const SubExpenseHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount = require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');
const VoucherNo = require('../../middleware/generateVoucherNo')
const CashBookLedger = require('../../middleware/createCashBookLedger')

module.exports = { 
  createVehicleDisposalExpense: async (req, res) => {
    const { head_of_account, amount, fuel_litre, vehicle_number, paid_date, vehicle_type,particular } = req.body;
    console.log(req.body);
    try {
      if (!paid_date || !fuel_litre || !head_of_account || !amount) {
        return res.status(400).json({ message: "All fields are required" });
      }
      let main_head_id;
      let sub_head_id;
      if (req.body.head_of_account) {
        ({ main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res));
      }
      const vehicleDisposalExpense = new VehicleDisposalExpense({
        paidDate: paid_date,
        mainHeadOfAccount: main_head_id,
        subHeadOfAccount: sub_head_id,
        amount: amount,
        fuelLitre: fuel_litre,
        vehicleNumber: vehicle_number,
        vehicleType: vehicle_type,
      });

      const update_id = vehicleDisposalExpense._id;

      const type = "expense";

      const cashVoucherNo = await VoucherNo.generateCashVoucherNo(req, res,type)
      await CashBookLedger.createCashBookLedger(req, res, cashVoucherNo, type, head_of_account,particular, amount, paid_date,update_id);
      await GeneralLedger.createGeneralLedger(req, res, cashVoucherNo, type, head_of_account, particular, amount, paid_date, null, null,update_id);


      await vehicleDisposalExpense.save();
      res.status(201).json({
        message: "Vehicle Disposal Expense created successfully",
        data: vehicleDisposalExpense,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateVehicleDisposalExpense: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      const vehicleDisposalExpense = await VehicleDisposalExpense.findById(id).exec();
      if (!vehicleDisposalExpense) {
        return res.status(404).json({ message: "Vehicle Disposal Expense not found" });
      }

      const updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.fuel_litre) {
        updateData.fuelLitre = req.body.fuel_litre;
      }
      if (req.body.vehicle_number) {
        updateData.vehicleNumber = req.body.vehicle_number;
      }
      if (req.body.vehicle_type) {
        updateData.vehicleType = req.body.vehicle_type;
      }
      if (req.body.head_of_account) {
        await CheckMainAndSubHeadOfAccount.getHeadOfAccount(req, res, updateData, vehicleDisposalExpense);
      }

      const updatedVehicleDisposalExpense = await VehicleDisposalExpense.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();

      res.status(200).json({
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
        const mainHeadOfAccount = await MainHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
        const subHeadOfAccount = await SubExpenseHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
  
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
        return res.status(404).json({ message: "Vehicle Disposal Expense not found" });
      }

      res.status(200).json(vehicleDisposalExpenses);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
