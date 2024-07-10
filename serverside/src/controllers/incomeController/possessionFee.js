const mongoose = require('mongoose');
const PossessionFee = require("../../models/incomeModels/pssessionFeeModel/possessionFee");
const Member = require("../../models/memberModels/memberList");

mongoose.model('Member', Member.schema);

module.exports = {
  createPossessionFee: async (req, res) => {
    const {
      member_no,
      challan_no,
      possession_fee,
      electricity_connection_charges,
      water_connection_charges,
      masjid_fund,
      construction_water,
      building_by_law_charges,
      date,
    } = req.body;
    console.log(req.body);
    try {
      if (
        !date ||
        !member_no ||
        !challan_no ||
        !possession_fee ||
        !electricity_connection_charges ||
        !water_connection_charges ||
        !masjid_fund ||
        !construction_water ||
        !building_by_law_charges
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      try {
        const member = await Member.findOne({ msNo: member_no });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const possessionFee = new PossessionFee({
            date: date,
            memberNo: member._id,
            challanNo: challan_no,
            possessionFee: possession_fee,
            electricityConnectionCharges: electricity_connection_charges,
            waterConnectionCharges: water_connection_charges,
            masjidFund: masjid_fund,
            constructionWater: construction_water,
            buildingBylawsCharges: building_by_law_charges,
        });

        await possessionFee.save();
        res.status(201).json({
            message: 'Possession Fee created successfully',
            data: possessionFee,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updatePossessionFee: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }
      const possessionFee = await PossessionFee.findById(id).exec();
      if (!possessionFee) {
        return res.status(404).json({ message: "Possession Fee not found" });
      }
      const updateData = {};
      if (req.body.member_no) {
        console.log(req.body.member_no);
        const member = await Member.findOne({ msNo: req.body.member_no });
        if (!member) {
          return res.status(404).json({ message: "Member not found" });
        }
        updateData.memberNo = member._id;
      }
      if (req.body.challan_no) {
        updateData.challanNo = req.body.challan_no;
      }
      if (req.body.date) {
        updateData.date = req.body.date;
      }
      if (req.body.possession_fee)
        updateData.possessionFee = req.body.possession_fee;
      if (req.body.electricity_connection_charges)
        updateData.electricityConnectionCharges =
          req.body.electricity_connection_charges;
      if (req.body.water_connection_charges)
        updateData.waterConnectionCharges = req.body.water_connection_charges;
      if (req.body.masjid_fund) updateData.masjidFund = req.body.masjid_fund;
      if (req.body.construction_water)
        updateData.constructionWater = req.body.construction_water;
      if (req.body.building_by_law_charges)
        updateData.buildingBylawsCharges = req.body.building_by_law_charges;
      await PossessionFee.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      res.status(200).json({
        message: "Possession Fee updated successfully",
        data: await PossessionFee.findById(id).exec(),
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  getPossessionFee: async (req, res) => {
    const { member_no } = req.query;
    try {
        if (!member_no) {
            return res.status(400).json({ message: 'member_no is required' });
        }
        const member = await Member.findOne({ msNo: member_no });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        const possessionFees = await PossessionFee.find({ memberNo: member._id })
            .populate('memberNo', 'msNo purchaseName')
            .exec();
        if (possessionFees.length === 0) {
            return res.status(404).json({ message: 'Possession Fee not found for this member' });
        }
        res.status(200).json(possessionFees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
  },
};
