const mongoose = require('mongoose');
const PossessionFee = require("../../models/incomeModels/pssessionFeeModel/possessionFee");
const Member = require("../../models/memberModels/memberList");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");


mongoose.model('Member', Member.schema);

module.exports = {
  createPossessionFee: async (req, res) => {
    const {
      member_no,
      challan_no,
      amount,
      head_of_account,
      paid_date,
    } = req.body;
    console.log(req.body);
    try {
      if (
        !paid_date ||
        !member_no ||
        !challan_no ||
        !amount ||
        !head_of_account
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const headOfAccountIds = head_of_account.split(',').map((id) => id.trim());
  
      try {
        const member = await Member.findOne({ $expr: { $eq: [ { $toString: "$msNo" }, `${req.body.member_no}` ] } });
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



        const possessionFee = new PossessionFee({
          memberNo: member._id,
          challanNo: challan_no,
          amount: amount,
          headOfAccount: headOfAccountIds,
          paidDate: paid_date,
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
  getHeadOfAccountPossessionFee: async (req, res) => {
    try {
      const headOfAccount = await IncomeHeadOfAccount.find({incomeType: 'Possession Heads'}).exec();
      if (headOfAccount.length === 0) {
        res.status(404).json({ message: "No head of accounts found" });
      } else {
        res.status(200).json(headOfAccount);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
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
        const member = await Member.findOne({ $expr: { $eq: [ { $toString: "$msNo" }, `${req.body.member_no}` ] } });
        if (!member) {
          return res.status(404).json({ message: "Member not found" });
        }
        updateData.memberNo = member._id;
      }
      if (req.body.challan_no) {
        updateData.challanNo = req.body.challan_no;
      }
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.head_of_account) {
        const headOfAccountIds = req.body.head_of_account.split(',').map((id) => id.trim());
        const incomeHeadOfAccounts = await IncomeHeadOfAccount.find({ _id: { $in: headOfAccountIds } }).exec();
        if (incomeHeadOfAccounts.length !== headOfAccountIds.length) {
          return res.status(404).json({ message: "One or more income head of account not found" });
        }
        const newHeadOfAccounts = incomeHeadOfAccounts.filter((account) => !possessionFee.headOfAccount.includes(account._id));
        updateData.headOfAccount = [...possessionFee.headOfAccount, ...newHeadOfAccounts.map((account) => account._id)];
      }
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
    const { id, sort,member_no } = req.query;
    let sortOrder = {};
    if (sort === 'asc') {
      sortOrder = { amount: 1 };
    } else if (sort === 'desc') {
      sortOrder = { amount: -1 };
    }

    try {
        if (id) {
          const possessionFee = await PossessionFee.findById(id)
            .populate('memberNo', 'msNo purchaseName')
            .populate('headOfAccount', 'headOfAccount')
            .exec();
          res.status(200).json(possessionFee);
        }
        const possessionFees = await PossessionFee.find()
            .populate('memberNo', 'msNo purchaseName')
            .populate('headOfAccount', 'headOfAccount')
            .sort(sortOrder)
            .exec();
        if (possessionFees.length === 0) {
            return res.status(404).json({ message: 'Possession Fee not found for this member' });
        }

        if (member_no) {
          const filteredPossessionFees = possessionFees.filter((possessionFee) => possessionFee.memberNo.msNo === member_no);
          res.status(200).json(filteredPossessionFees);
        } else {
          res.status(200).json(possessionFees);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
  },
};
