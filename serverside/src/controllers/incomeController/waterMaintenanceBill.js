const Member = require("../../models/memberModels/memberList");
const WaterMaintenancBill = require("../../models/incomeModels/waterMaintenanceBillModel/waterMaintenanceBill")
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");

module.exports = {
  createWaterMaintenanceBill: async (req, res) => {
    const { member_no, reference_no, billing_month, amount, paid_date, plot_no,head_of_account } = req.body;
  
    try {
      if (!paid_date || !member_no || !reference_no || !billing_month || !amount || !plot_no || !head_of_account) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const members = member_no.split(',').map((member) => member.trim());
      const references = reference_no.split(',').map((reference) => parseInt(reference.trim()));
      const paidDates = paid_date.split(',').map((date) => new Date(date.trim()));
      const billingMonths = billing_month.split(',').map((month) => month.trim());
      const amounts = amount.split(',').map((amt) => parseFloat(amt.trim()));
      const plotNos = plot_no.split(',').map((plot) => plot.trim());

      const incomeHeadOfAccount = await IncomeHeadOfAccount.findOne({headOfAccount:head_of_account}).exec();
            if (!incomeHeadOfAccount) {
                return res.status(404).json({ message: "Income head of account not found" });
            }
  
      if (members.length !== references.length || members.length !== paidDates.length || members.length !== billingMonths.length || members.length !== amounts.length || members.length !== plotNos.length) {
        return res.status(400).json({ message: "Invalid input: members, references, paid dates, billing months, amounts, and plot nos must have the same length" });
      }
  
      const promises = members.map(async (member, index) => {
        const memberDoc = await Member.findOne({ $expr: { $eq: [ { $toString: "$msNo" }, `${member}` ] } });
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
          incomeHeadOfAccount: incomeHeadOfAccount._id
        });
  
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
      const { plotNo, sortBy, sortOrder } = req.query; 
      const filter = {};
      if (plotNo) {
        filter['plotNo'] = plotNo; 
      }
  
      const sort = {};
      if (sortBy) {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1; 
      }
  
      const waterMaintenanceBill = await WaterMaintenancBill.find(filter)
        .populate('memberNo', 'msNo purchaseName')
        .populate('incomeHeadOfAccount', 'headOfAccount')
        .sort(sort) 
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
        return res.status(404).json({ message: "Water Maintenance Income not found" });
      }
      const updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.member_no) {
        const member = await Member.findOne({ $expr: { $eq: [ { $toString: "$msNo" }, `${req.body.member_no}` ] } });
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
      if(req.body.head_of_account){
        const incomeHeadOfAccount = await IncomeHeadOfAccount.findOne({headOfAccount:req.body.head_of_account}).exec();
        if (!incomeHeadOfAccount) {
            return res.status(404).json({ message: "Income head of account not found" });
        }
        updateData.incomeHeadOfAccount = incomeHeadOfAccount._id;
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
