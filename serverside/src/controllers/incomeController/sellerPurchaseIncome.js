const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount")
const SellerPurchaseIncome = require("../../models/incomeModels/sellerPurchaseIncome/sellerPurchaseIncome")

module.exports = {
  createSellerPurchaseIncome: async (req, res) => {
    const {
      member_no,
      challan_no,
      head_of_account,
      address,
      amount,
      date,
    } = req.body;
    try {
      if (
        !date ||
        !member_no ||
        !challan_no ||
        !head_of_account ||
        !amount
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const member = await Member.findOne({ msNo: member_no });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      const headOfAccount = await HeadOfAccount.findOne({ headOfAccount: head_of_account });
      if (!headOfAccount) {
        return res.status(404).json({ message: "Head of Account not found" });
      }
      const sellerPurchaseIncome = new SellerPurchaseIncome({
        date: date,
        memberNo: member._id,
        challanNo: challan_no,
        headOfAccount: headOfAccount._id,
        address: address,
        amount: amount,
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
      const updateData = {};
      if (req.body.date) {
        updateData.date = req.body.date;
      }
      if (req.body.member_no) {
        const member = await Member.findOne({ msNo: req.body.member_no });
        if (!member) {
          return res.status(404).json({ message: "Member not found" });
        }
        updateData.memberNo = member._id;
      }
      if (req.body.challan_no) {
        updateData.challanNo = req.body.challan_no;
      }
      if (req.body.amount) {
        updateData.amount = req.body.amount;
      }
      if (req.body.address) {
        updateData.address = req.body.address;
      }
      if (req.body.head_of_account) {
        const headOfAccount = await HeadOfAccount.findOne({ headOfAccount: req.body.head_of_account });
        if (!headOfAccount) {
          return res.status(404).json({ message: "Head of Account not found" });
        }
        updateData.headOfAccount = headOfAccount._id;
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
    const { member_no } = req.query;
    try {
      let member;
      let sellerPurchaseIncome;
  
      if (member_no) {
        member = await Member.findOne({ msNo: member_no });
        if (!member) {
          return res.status(404).json({ message: 'Member not found' });
        }
  
        sellerPurchaseIncome = await SellerPurchaseIncome.find({ memberNo: member._id })
          .populate('memberNo', 'msNo purchaseName')
          .populate('headOfAccount', 'headOfAccount')
          .exec();
      } else {
        sellerPurchaseIncome = await SellerPurchaseIncome.find()
          .populate('memberNo', 'msNo purchaseName')
          .populate('headOfAccount', 'headOfAccount')
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
