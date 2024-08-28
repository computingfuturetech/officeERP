const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount")
const SellerPurchaseIncome = require("../../models/incomeModels/sellerPurchaseIncome/sellerPurchaseIncome")
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const VoucherNo = require('../../middleware/generateVoucherNo')
const CashBookLedger = require('../../middleware/createCashBookLedger')
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');
const IncomeType = require('../../models/incomeModels/incomeHeadOfAccount/typeOfHeadOfAccount');
const MemberList = require("../../models/memberModels/memberList");

async function transformPaymentDetails(record) {
  if (record.paymentDetail instanceof Map) {
    const transformedPaymentDetail = new Map();
    for (let [iid, amount] of record.paymentDetail) {
      try {
        const headOfAccountResult = await IncomeHeadOfAccount.findOne({ _id: iid }).exec();
        if (headOfAccountResult) {
          const name = headOfAccountResult.headOfAccount;
          transformedPaymentDetail.set(name, amount);
        }
      } catch (error) {
        console.error(`Error retrieving Head of Account for ID: ${iid}`, error);
      }
    }
    record.paymentDetail = transformedPaymentDetail;
  } else {
    console.log("Payment details are not a Map or invalid");
  }
  return record;
}

module.exports = {
  createSellerPurchaseIncome: async (req, res) => {
    const {
      member_no, challan_no, paid_date, type, payment, cheque_no, bank_account, particular, paymentType
    } = req.body;
    try {
      if (!paid_date || !member_no || !challan_no || !type) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
      const member = await Member.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${member_no}`] } });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      let incomeType = await IncomeType.find({ type: type }).exec();
      for (let i = 0; i < incomeType.length; i++) {
        let headOfAccounts = await IncomeHeadOfAccount.find({ type: incomeType[i]._id }).exec();
        for (let headOfAccount of headOfAccounts) {
          const idString = headOfAccount._id.toString();
          if (!payment.hasOwnProperty(idString)) {
            payment[idString] = 0;
          }
        }
      }
      const createSellerPurchaser = new SellerPurchaseIncome({
        paidDate: paid_date,
        memberNo: member._id,
        challanNo: challan_no,
        address: member.address,
        particular: particular,
        type: type,
        paymentDetail: payment,
        check: paymentType,
        bankAccount: bank_account,
        chequeNo: cheque_no,
      });
      const type_of_entry = "income";
      const check = paymentType;
      const paymentEntries = Object.entries(payment);
      if (paymentEntries.length > 0) {
        for (const [id, amount] of paymentEntries) {
          const headOfAccountResult = await IncomeHeadOfAccount.findOne({ _id: id }).exec();
          let name = headOfAccountResult.headOfAccount;
          if (check === 'Cash') {
            const voucherNo = await VoucherNo.generateCashVoucherNo(req, res, type_of_entry);
            await CashBookLedger.createCashBookLedger(req, res, voucherNo, type_of_entry, name, particular, amount, paid_date, createSellerPurchaser._id);
            await GeneralLedger.createGeneralLedger(req, res, voucherNo, type_of_entry, name, particular, amount, paid_date, cheque_no, challan_no, createSellerPurchaser._id,bank_account);
          }
          else if (check === 'Bank') {
            const voucherNo = await VoucherNo.generateBankVoucherNo(req, res, bank_account, type_of_entry);
            await BankLedger.createBankLedger(req, res, voucherNo, type_of_entry, name, particular, amount, paid_date, cheque_no, challan_no, createSellerPurchaser._id,bank_account);
            await GeneralLedger.createGeneralLedger(req, res, voucherNo, type_of_entry, name, particular, amount, paid_date, cheque_no, challan_no, createSellerPurchaser._id,bank_account);
          }
        }
      } else {
        console.log("Payment object is empty");
      }
      await createSellerPurchaser.save();
      res.status(201).json({
        message: "Seller Purchase Income created successfully",
        data: createSellerPurchaser
      });
    } catch (err) {
      console.error("Error creating seller purchase income:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getSellerPurchaseIncome: async (req, res) => {
    const { member_no, type, sort, id, search } = req.query;
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
      if (search) {
        let member = await MemberList.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${search}`] } });
        if (member) {
          filter.memberNo = member._id;
        } else {
          return res.status(200).json([]);
        }
      }
      let sellerPurchaseIncome;
      if (id) {
        sellerPurchaseIncome = await SellerPurchaseIncome.findById(id)
          .populate('memberNo', 'msNo purchaseName')
          .exec();
        if (sellerPurchaseIncome) {
          sellerPurchaseIncome = await transformPaymentDetails(sellerPurchaseIncome);
        }
      } else {
        sellerPurchaseIncome = await SellerPurchaseIncome.find(filter)
          .populate('memberNo', 'msNo purchaseName')
          .sort(sortOrder)
          .exec();
        if (sellerPurchaseIncome.length > 0) {
          sellerPurchaseIncome = await Promise.all(
            sellerPurchaseIncome.map(async (record) => {
              return await transformPaymentDetails(record);
            })
          );
        }
      }
      if (!sellerPurchaseIncome || (Array.isArray(sellerPurchaseIncome) && sellerPurchaseIncome.length === 0)) {
        return res.status(404).json({ message: 'Seller Purchase Income not found' });
      }
      if (member_no) {
        const filteredSellerPurchaseIncome = sellerPurchaseIncome.filter(
          (item) => item.memberNo.msNo === member_no
        );
        return res.status(200).json(filteredSellerPurchaseIncome);
      } else {
        return res.status(200).json(sellerPurchaseIncome);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
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
        return res.status(404).json({ message: "Seller PurchaseIncome not found" });
      }
      let updateData = {};
      if (req.body.paid_date) {
        updateData.paidDate = req.body.paid_date;
      }
      if (req.body.challan_no) {
        updateData.challan_no = req.body.challan_no;
      }
      if (req.body.particular) {
        updateData.particular = req.body.particular;
      }
      if (req.body.cheque_no) {
        updateData.chequeNo = req.body.cheque_no;
      }
      if (req.body.member_no) {
        const member = await Member.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${req.body.member_no}`] } });
        if (!member) {
          return res.status(404).json({ message: "Member not found" });
        }
        updateData.memberNo = member._id;
      }
      updateData = req.body;
      const type = 'income';
      if (updateData.paymentDetail && typeof updateData.paymentDetail === 'object') {
        for (const [name, amount] of Object.entries(updateData.paymentDetail)) {
          let payment_type = req.body.check;
          updateData = {
            ...updateData,
            amount: amount
          }
          if (payment_type == "Cash") {
            await CashBookLedger.updateSellerPurchaserCashLedger(req, res, id, updateData, type, name);
            await GeneralLedger.updateSellerPurchaserPossessionGeneralLedger(req, res, id, updateData, type, name);
          }
          else if (payment_type == 'Bank') {
            await BankLedger.updateSellerPurchaserBankLedger(req, res, id, updateData, type, name);
            await GeneralLedger.updateSellerPurchaserPossessionGeneralLedger(req, res, id, updateData, type, name);
          }
        }
      }
      if (req.body.paymentDetail) {
        const paymentDetail = req.body.paymentDetail;
        const transformedPaymentDetail = {};
        for (const [name, amount] of Object.entries(paymentDetail)) {
          try {
            const headOfAccount = await IncomeHeadOfAccount.findOne({ headOfAccount: name }).exec();
            if (headOfAccount) {
              transformedPaymentDetail[headOfAccount._id] = amount;
            } else {
              console.log(`Head of Account not found for name: ${name}`);
            }
          } catch (error) {
            console.error(`Error retrieving Head of Account for name: ${name}`, error);
          }
        }
        updateData.paymentDetail = transformedPaymentDetail;
      }
      const updatedSellerPurchaser = await SellerPurchaseIncome.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).exec();
      res.status(200).json({
        message: "Seller Purchaser updated successfully",
        data: updatedSellerPurchaser,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};


