const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount")
const SellerPurchaseIncome = require("../../models/incomeModels/sellerPurchaseIncome/sellerPurchaseIncome")
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const VoucherNo = require('../../middleware/generateVoucherNo')
const CashBookLedger = require('../../middleware/createCashBookLedger')
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');

module.exports = {
  createSellerPurchaseIncome: async (req, res) => {
    const {
      member_no, challan_no, paid_date, type, payment, cheque_no, bank_account, particular, paymentType
    } = req.body;
    console.log(req.body)
    console.log(paymentType)
    try {
      if (!paid_date || !member_no || !challan_no || !type) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }
      const member = await Member.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${member_no}`] } });
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      const createSellerPurchaser = new SellerPurchaseIncome({
        paidDate: paid_date,
        memberNo: member._id,
        challanNo: challan_no,
        address: member.address,
        type: type,
        paymentDetail: payment
      });
      const type_of_entry = "income";
      const check = paymentType;

      const paymentEntries = Object.entries(payment);

      if (paymentEntries.length > 0) {
        console.log("Found")
        for (const [id, amount] of paymentEntries) {
          const headOfAccountResult = await IncomeHeadOfAccount.findOne({ _id: id }).exec();
          let name = headOfAccountResult.headOfAccount;
          if (check === 'Cash') {

            voucherNo = await VoucherNo.generateCashVoucherNo(req, res, type_of_entry);
            await CashBookLedger.createCashBookLedger(req, res, voucherNo, type_of_entry, name, particular, amount, paid_date, createSellerPurchaser._id);
            await GeneralLedger.createGeneralLedger(req, res, voucherNo, type_of_entry, name, particular, amount, paid_date, cheque_no, challan_no, createSellerPurchaser._id);
          }
          else if (check === 'Bank') {
            voucherNo = await VoucherNo.generateBankVoucherNo(req, res, bank_account, type_of_entry);
            await BankLedger.createBankLedger(req, res, voucherNo, type_of_entry, name, particular, amount, paid_date, cheque_no, challan_no, createSellerPurchaser._id);
            await GeneralLedger.createGeneralLedger(req, res, voucherNo, type_of_entry, name, particular, amount, paid_date, cheque_no, challan_no, createSellerPurchaser._id);
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
          .exec();
      } else {
        sellerPurchaseIncome = await SellerPurchaseIncome.find(filter)
          .populate('memberNo', 'msNo purchaseName')
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

      console.log(sellerPurchaseIncome)

      let updateData = {};
      // if (req.body.paid_date) {
      //   updateData.paidDate = req.body.paid_date;
      // }
      // if (req.body.challan_no) {
      //   updateData.challan_no = req.body.challan_no;
      // }
      // if (req.body.particular) {
      //   updateData.particular = req.body.particular;
      // }
      // if (req.body.cheque_no) {
      //   updateData.chequeNo = req.body.cheque_no;
      // }
      // if (req.body.member_no) {
      //   const member = await Member.findOne({ $expr: { $eq: [{ $toString: "$msNo" }, `${req.body.member_no}`] } });
      //   if (!member) {
      //     return res.status(404).json({ message: "Member not found" });
      //   }
      //   updateData.memberNo = member._id;
      // }

      const type = 'income';
      if (sellerPurchaseIncome && sellerPurchaseIncome.paymentDetail instanceof Map) {
        for (let [iid, amount] of sellerPurchaseIncome.paymentDetail) {
          try {
            const headOfAccountResult = await IncomeHeadOfAccount.findOne({ _id: iid }).exec();
            console.log("Heloo")
            console.log(headOfAccountResult)
            let name = headOfAccountResult.headOfAccount;
            let check = "Bank";
            updateData = {
              amount: "1000"
            };
            if (check === 'Cash') {
              await CashBookLedger.updateSellerPurchaserCashLedger(req, res, id, updateData, type, name);

            } else if (check === 'Bank') {
              await BankLedger.updateSellerPurchaserBankLedger(req, res, id, updateData, type, name);

            }
            console.log("hello")
          } catch (error) {
            console.error(`Error retrieving Head of Account for ID: ${id}`, error);
          }
        }
      } else {
        console.log("Payment details are not a Map or Seller PurchaseIncome not found");
      }

      // const updatedSellerPurchaser = await SellerPurchaseIncome.findByIdAndUpdate(
      //   id,
      //   { $set: updateData },
      //   { new: true }
      // ).exec();
      // res.status(200).json({
      //   message: "Seller Purchaser updated successfully",
      //   data: updatedSellerPurchaser,
      // });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};


