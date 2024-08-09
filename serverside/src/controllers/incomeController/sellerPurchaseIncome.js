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
      amount,
      head_of_account,
      type
    } = req.body;
    try {
      if (
        !paid_date ||
        !member_no ||
        !challan_no ||
        !address ||
        !amount  ||
        !head_of_account ||
        !type
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const member = await Member.findOne({ $expr: { $eq: [ { $toString: "$msNo" }, `${req.body.member_no}` ] } });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      const incomeHeadOfAccount = await IncomeHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
      if (!incomeHeadOfAccount) {
        return res.status(404).json({ message: 'Income head of account not found' });
      }

      const sellerPurchaseIncome = new SellerPurchaseIncome({
        paidDate: paid_date,
        memberNo: member._id,
        challanNo: challan_no,
        address: address,
        amount: amount,
        headOfAccount:incomeHeadOfAccount._id,
        type: type,
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
        member_no,
        challan_no,
        address,
        paid_date,
        amount,
        head_of_account,
      } = req.body;
      const updateData = {};
      if (paid_date) {
        updateData.paidDate = paid_date;
      }
      if (member_no) {
        const member = await Member.findOne({ $expr: { $eq: [ { $toString: "$msNo" }, `${req.body.member_no}` ] } });
        if (!member) {
          return res.status(404).json({ message: "Member not found" });
        }
        updateData.memberNo = member._id;
      }

      if (head_of_account) {
        const incomeHeadOfAccount = await IncomeHeadOfAccount.findOne({ headOfAccount: head_of_account }).exec();
        if (!incomeHeadOfAccount) {
          return res.status(404).json({ message: 'Income head of account not found' });
        }
        updateData.headOfAccount = incomeHeadOfAccount._id;
      }

      if (challan_no) {
        updateData.challanNo = challan_no;
      }
      if (address) {
        updateData.address = address;
      }
      if (paid_date) {
        updateData.paidDate = paid_date;
      }
      if (amount) {
        updateData.amount = amount;
      }
      
      const updateSellerPurchase = await SellerPurchaseIncome.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();
      res.status(200).json({
        message: "Seller Purchase Income update successfully",
        data: updateSellerPurchase,
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
