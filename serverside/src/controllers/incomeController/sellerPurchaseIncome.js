const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount")
const SellerPurchaseIncome = require("../../models/incomeModels/sellerPurchaseIncome/sellerPurchaseIncome")

module.exports = {
  createSellerPurchaseIncome: async (req, res) => {
    const {
      ms_no,
      challan_no,
      noc_fee,
      masjid_fund,
      dual_owner_fee,
      covered_area_fee,
      share_money,
      deposit_for_land_cost,
      deposit_for_development_charges,
      additional_development_charges,
      electricity_charges,
      address,
      date,
    } = req.body;
    try {
      if (
        !date ||
        !ms_no ||
        !challan_no ||
        !address
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const member = await Member.findOne({ msNo: ms_no });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      const sellerPurchaseIncome = new SellerPurchaseIncome({
        date: date,
        memberNo: member._id,
        challanNo: challan_no,
        address: address,
        nocFee: noc_fee ?? 0,
        masjidFund: masjid_fund ?? 0,
        dualOwnerFee: dual_owner_fee ?? 0,
        coveredAreaFee: covered_area_fee ?? 0,
        shareMoney: share_money ?? 0,
        depositForLandCost: deposit_for_land_cost ?? 0,
        depositForDevelopmentCharges: deposit_for_development_charges ?? 0,
        additionalDevelopmentCharges: additional_development_charges ?? 0,
        electricityCharges: electricity_charges ?? 0
      });
      await sellerPurchaseIncome.save();
      res.status(201).json({
        message: "Seller Purchaser created successfully",
        data: sellerPurchaseIncome,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateSellerPurchaseIncome: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }
      const sellerPurchaseIncome = await SellerPurchaseIncome.findById(id).exec();
      if (!sellerPurchaseIncome) {
        return res.status(404).json({ message: "Seller Purchase Income not found" });
      }
      const {
        ms_no,
        challan_no,
        noc_fee,
        masjid_fund,
        dual_owner_fee,
        covered_area_fee,
        share_money,
        deposit_for_land_cost,
        deposit_for_development_charges,
        additional_development_charges,
        electricity_charges,
        address,
        date,
      } = req.body;
      const updateData = {};
      if (date) {
        updateData.date = date;
      }
      if (ms_no) {
        const member = await Member.findOne({ msNo: ms_no });
        if (!member) {
          return res.status(404).json({ message: "Member not found" });
        }
        updateData.memberNo = member._id;
      }
      if (challan_no) {
        updateData.challanNo = challan_no;
      }
      if (address) {
        updateData.address = address;
      }
      if (noc_fee !== undefined) {
        updateData.nocFee = noc_fee;
      }
      if (masjid_fund !== undefined) {
        updateData.masjidFund = masjid_fund;
      }
      if (dual_owner_fee !== undefined) {
        updateData.dualOwnerFee = dual_owner_fee;
      }
      if (covered_area_fee !== undefined) {
        updateData.coveredAreaFee = covered_area_fee;
      }
      if (share_money !== undefined) {
        updateData.shareMoney = share_money;
      }
      if (deposit_for_land_cost !== undefined) {
        updateData.depositForLandCost = deposit_for_land_cost;
      }
      if (deposit_for_development_charges !== undefined) {
        updateData.depositForDevelopmentCharges = deposit_for_development_charges;
      }
      if (additional_development_charges !== undefined) {
        updateData.additionalDevelopmentCharges = additional_development_charges;
      }
      if (electricity_charges !== undefined) {
        updateData.electricityCharges = electricity_charges;
      }
      console.log("Update Data:", updateData);
      const updatedSellerPurchaseIncome = await SellerPurchaseIncome.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();
      res.status(200).json({
        message: "Seller Purchase Income updated successfully",
        data: updatedSellerPurchaseIncome,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getSellerPurchaseIncome: async (req, res) => {
    const { ms_no } = req.query;
    try {
      let sellerPurchaseIncome;

      if (ms_no) {
        const memberNo = await Member.findOne({ msNo: ms_no }).exec();
        if (!memberNo) {
          return res.status(404).json({ message: 'Member not found' });
        }

        sellerPurchaseIncome = await SellerPurchaseIncome.find({ memberNo: memberNo._id })
          .populate('memberNo', 'msNo purchaseName')
          .exec();
      } else {
        sellerPurchaseIncome = await SellerPurchaseIncome.find()
          .populate('memberNo', 'msNo purchaseName')
          .exec();
      }

      if (sellerPurchaseIncome.length > 0) {
        return res.status(200).json(sellerPurchaseIncome);
      } else {
        return res.status(404).json({ message: 'Seller Purchase Income not found' });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
