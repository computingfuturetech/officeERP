const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount")
const SellerPurchaseIncome = require("../../models/incomeModels/sellerPurchaseIncome/sellerPurchaseIncome")
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");

module.exports = {
  createSellerPurchaseIncome: async (req, res) => {
    const {
      member_no,
      challan_no,
      address,
      paid_date,
      type,
      noc_fee,
      masjid_fund,
      dual_owner_fee,
      covered_area_fee,
      share_money,
      deposit_for_land_cost,
      deposit_for_development_charges,
      additional_development_charges,
      electricity_charges,
    } = req.body;

    try {
      if (!paid_date || !member_no || !challan_no || !type) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      const member = await Member.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${member_no}`] } });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      const incomeHeadOfAccounts = await IncomeHeadOfAccount.find({
        incomeType: type
    }).exec();

    if (incomeHeadOfAccounts.length === 0) {
        return res.status(404).json({ message: "No income head of account found for the given type" });
    }

    const headOfAccountIds = incomeHeadOfAccounts.map(account => account._id);

      const sellerPurchaseIncome = new SellerPurchaseIncome({
        paidDate: paid_date,
        memberNo: member._id,
        challanNo: challan_no,
        address: address,
        headOfAccount: headOfAccountIds,
        type: type,
        nocFee: noc_fee   ? noc_fee : 0,
        masjidFund: masjid_fund ? masjid_fund : 0,
        dualOwnerFee: dual_owner_fee ? dual_owner_fee : 0,
        coveredAreaFee: covered_area_fee ? covered_area_fee : 0,
        shareMoney: share_money ? share_money : 0,
        depositForLandCost: deposit_for_land_cost ? deposit_for_land_cost : 0,
        depositForDevelopmentCharges: deposit_for_development_charges ? deposit_for_development_charges : 0,
        additionalDevelopmentCharges: additional_development_charges  ? additional_development_charges : 0,
        electricityCharges: electricity_charges ? electricity_charges : 0,
      });

      await sellerPurchaseIncome.save();

      res.status(201).json({
        message: "Seller Purchaser created successfully",
        data: sellerPurchaseIncome,
      });
    } catch (err) {
      console.error("Error creating seller purchase income:", err);
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
        member_no,
        challan_no,
        address,
        paid_date,
        noc_fee,
        masjid_fund,
        dual_owner_fee,
        covered_area_fee,
        share_money,
        deposit_for_land_cost,
        deposit_for_development_charges,
        additional_development_charges,
        electricity_charges,
      } = req.body;

      const updateData = {};

      if (member_no) {
        const member = await Member.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${member_no}`] } });
        if (!member) {
          return res.status(404).json({ message: "Member not found" });
        }
        updateData.memberNo = member._id;
      }


      if (challan_no) updateData.challanNo = challan_no;
      if (address) updateData.address = address;
      if (paid_date) updateData.paidDate = paid_date;


      if (noc_fee) updateData.nocFee = noc_fee;
      if (masjid_fund) updateData.masjidFund = masjid_fund;
      if (dual_owner_fee) updateData.dualOwnerFee = dual_owner_fee;
      if (covered_area_fee) updateData.coveredAreaFee = covered_area_fee;
      if (share_money) updateData.shareMoney = share_money;
      if (deposit_for_land_cost) updateData.depositForLandCost = deposit_for_land_cost;
      if (deposit_for_development_charges) updateData.depositForDevelopmentCharges = deposit_for_development_charges;
      if (additional_development_charges) updateData.additionalDevelopmentCharges = additional_development_charges;
      if (electricity_charges) updateData.electricityCharges = electricity_charges;

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
    const { member_no, type, sort, id } = req.query;
    try {
      let sortOrder = {};
      if (sort === 'asc') {
        sortOrder = { amount: 1 };
      } else if (sort === 'desc') {
        sortOrder = { amount: -1 };
      }

      let filter = {};
      if (type) {
        filter.type = type;
      }

      let sellerPurchaseIncome;

      if (id) {
        sellerPurchaseIncome = await SellerPurchaseIncome.findById(id)
          .populate('memberNo', 'msNo purchaseName')
          .populate('headOfAccount', 'headOfAccount incomeType')
          .exec();
      } else {
        sellerPurchaseIncome = await SellerPurchaseIncome.find(filter)
          .populate('memberNo', 'msNo purchaseName')
          .populate('headOfAccount', 'headOfAccount incomeType')
          .sort(sortOrder)
          .exec();
      }

      if (sellerPurchaseIncome.length === 0) {
        return res.status(404).json({ message: 'Seller Purchase Income not found' });
      }

      if (member_no) {
        const filteredSellerPurchaseIncome = sellerPurchaseIncome.filter((sellerPurchaseIncome) => sellerPurchaseIncome.memberNo.msNo === member_no);
        res.status(200).json(filteredSellerPurchaseIncome);
      } else {
        res.status(200).json(sellerPurchaseIncome);
      }

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
