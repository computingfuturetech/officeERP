const Member = require("../../models/memberModels/memberList");
const WaterMaintenancBill = require("../../models/incomeModels/waterMaintenanceBillModel/waterMaintenanceBill")
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const VoucherNo = require('../../middleware/generateVoucherNo')
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');
const CashBookLedger = require('../../middleware/createCashBookLedger')
const mongoose = require("mongoose");

module.exports = {
  createWaterMaintenanceBill: async (req, res) => {
    const {
      member_no, reference_no, billing_month, amount, paid_date, plot_no,challan_no
    } = req.body;
    const head_of_account = "Water/Maintenance Bill";
    try {
      if (!paid_date || !member_no || !reference_no || !billing_month || !amount || !plot_no) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const members = member_no.split(',').map((member) => member.trim());
      const references = reference_no.split(',').map((reference) => parseInt(reference.trim()));
      const paidDates = paid_date.split(',').map((date) => new Date(date.trim()));
      const billingMonths = billing_month.split(',').map((month) => month.trim());
      const amounts = amount.split(',').map((amt) => parseFloat(amt.trim()));
      const plotNos = plot_no.split(',').map((plot) => plot.trim());
      const challanNos = challan_no.split(',').map((challan) => challan.trim());
      const incomeHeadOfAccount = await IncomeHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
      if (!incomeHeadOfAccount) {
        return res.status(404).json({ message: "Income head of account not found" });
      }
      if (members.length !== references.length || members.length !== paidDates.length || members.length !== billingMonths.length || members.length !== amounts.length || members.length !== plotNos.length || members.length !== challanNos.length) {
        return res.status(400).json({ message: "Invalid input: members, references, paid dates, billing months, amounts, and plot nos must have the same length" });
      }
      const promises = members.map(async (member, index) => {
        const memberDoc = await Member.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${member}`] } });
        if (!memberDoc) {
          console.log(`Member not found for msNo: ${member}`);
          throw new Error(`Member not found for msNo: ${member}`);
        }
        const waterMaintenanceBill = new WaterMaintenancBill({
          paidDate: paidDates[index],
          memberNo: memberDoc._id,
          referenceNo: references[index],
          billingMonth: billingMonths[index],
          amount: amounts[index],
          plotNo: plotNos[index],
          incomeHeadOfAccount: incomeHeadOfAccount._id,
          challanNo: challanNos[index],
        });
        const update_id = waterMaintenanceBill._id;
        const type = "income";
        const cashVoucherNo = await VoucherNo.generateCashVoucherNo(req, res, type);
        await CashBookLedger.createCashBookLedger(req, res, cashVoucherNo, type, head_of_account, billingMonths[index], amounts[index], paidDates[index], update_id);
        await GeneralLedger.createGeneralLedger(req, res, cashVoucherNo, type, head_of_account, billingMonths[index], amounts[index], paidDates[index], null, challanNos[index], update_id,null);   
        return waterMaintenanceBill.save();
      });
      const createdWaterMaintenanceBills = await Promise.all(promises);
      res.status(201).json({
        message: "Water Maintenance Bills created successfully",
        data: createdWaterMaintenanceBills,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getWaterMaintenanceBill: async (req, res) => {
    try {
      const { plotNo, sort, id, member_no,search } = req.query;
      let filter = {};
      if (plotNo) {
        filter.plotNo = plotNo;
      }
      let sortOrder = {};
      if (sort === 'asc') {
        sortOrder = { amount: 1 };
      } else if (sort === 'desc') {
        sortOrder = { amount: -1 };
      }
      if (search) {
        let member = await MemberList.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${search}`] } });
        if (member) {
          filter.memberNo = member._id;
        } else {
          return res.status(200).json([]);
        }
      }
      let waterMaintenanceBill;
      if (id) {
        waterMaintenanceBill = await WaterMaintenancBill.findById(id)
          .populate('memberNo', 'msNo purchaseName')
          .populate('incomeHeadOfAccount', 'headOfAccount')
          .exec();
      } else {
        waterMaintenanceBill = await WaterMaintenancBill.find(filter)
          .populate('memberNo', 'msNo purchaseName')
          .populate('incomeHeadOfAccount', 'headOfAccount')
          .sort(sortOrder)
          .exec();
      }
      if (waterMaintenanceBill.length === 0) {
        res.status(404).json({ message: 'Water Maintenance Bill not found' });
      } else if (member_no) {
        const filteredWaterMaintenanceBill = waterMaintenanceBill.filter((bill) => bill.memberNo.msNo === member_no);
        res.status(200).json(filteredWaterMaintenanceBill);
      } else {
        res.status(200).json(waterMaintenanceBill);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateWaterMaintenanceBill: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }
      const waterMaintenanceBill = await WaterMaintenancBill.findById(id).exec();
      if (!waterMaintenanceBill) {
        return res.status(404).json({ message: "Water Maintenance Income not found" });
      }
      const updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.member_no) {
        const member = await Member.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${req.body.member_no}`] } });
        if (!member) {
          return res.status(404).json({ message: "Member not found" });
        }
        updateData.memberNo = member._id;
      }
      if (req.body.reference_no) {
        updateData.referenceNo = req.body.reference_no
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.billing_month) {
        updateData.billingMonth = req.body.billing_month;
      }
      if (req.body.plot_no) {
        updateData.plotNo = req.body.plot_no;
      }
      if (req.body.challan_no) {
        updateData.challanNo = req.body.challan_no;
      }
      const type = "income";
      await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
      await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      const updatedWaterMaintenanceBill = await WaterMaintenancBill.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();
      res.status(200).json({
        message: "Water Maintenance Bill updated successfully",
        data: updatedWaterMaintenanceBill,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
