const Member = require("../../models/memberModels/memberList");
const WaterMaintenancBill = require("../../models/incomeModels/waterMaintenanceBillModel/waterMaintenanceBill")

module.exports = {
  createWaterMaintenanceBill: async (req, res) => {
    const {
      member_no,
      reference_no, 
      billing_month,
      amount,
      paid_date,
    } = req.body;
    try {
      if (
        !paid_date ||
        !member_no ||
        !reference_no ||
        !billing_month || 
        !amount 
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const member = await Member.findOne({ msNo: member_no });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      const waterMaintenanceBill= new WaterMaintenancBill({
        paidDate: paid_date,
        memberNo: member._id,
        referenceNo: reference_no,
        billinMonth: billing_month,
        amount: amount,
      });
      await waterMaintenanceBill.save();
      res.status(201).json({
        message: "Water Maintenance Bill created successfully",
        data: waterMaintenanceBill,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getWaterMaintenanceBill: async (req, res) => {
    try {
        const waterMaintenanceBill = await WaterMaintenancBill.find()
            .populate('memberNo', 'msNo purchaseName plotNo')
            .exec();
        if (waterMaintenanceBill.length === 0) {
            return res.status(404).json({ message: 'Water Maintenance Bill not found' });
        }
        res.status(200).json(waterMaintenanceBill);
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
        return res.status(404).json({ message: "Seller Purchase Income not found" });
      }
      const updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.member_no) {
        const member = await Member.findOne({ msNo: req.body.member_no });
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
      console.log("Update Data:", updateData);
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
