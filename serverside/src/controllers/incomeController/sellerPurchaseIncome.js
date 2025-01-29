const Member = require("../../models/memberModels/memberList");
const HeadOfAccount = require("../../models/headOfAccountModel/headOfAccount");
const SellerPurchaseIncome = require("../../models/incomeModels/sellerPurchaseIncome/sellerPurchaseIncome");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const VoucherNo = require("../../middleware/generateVoucherNo");
const CashBookLedger = require("../../middleware/createCashBookLedger");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");
const IncomeType = require("../../models/incomeModels/incomeHeadOfAccount/typeOfHeadOfAccount");
const MemberList = require("../../models/memberModels/memberList");

async function transformPaymentDetails(record) {
  if (record.paymentDetail instanceof Map) {
    const transformedPaymentDetail = new Map();
    for (let [iid, amount] of record.paymentDetail) {
      try {
        const headOfAccountResult = await IncomeHeadOfAccount.findOne({
          _id: iid,
        }).exec();
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
      msNo,
      challanNo,
      paidDate,
      type,
      payment,
      chequeNumber,
      bank,
      particular,
      paymentType,
    } = req.body;
    try {
      if (!paymentType) {
        return res.status(400).json({
          status: "error",
          message: "Payment type is required",
        });
      }

      if (!msNo) {
        return res.status(400).json({
          status: "error",
          message: "Member number is required",
        });
      }

      if (!challanNo) {
        return res.status(400).json({
          status: "error",
          message: "Challan number is required",
        });
      }

      if (!type) {
        return res.status(400).json({
          status: "error",
          message: "Type is required",
        });
      }

      const member = await Member.findOne({
        msNo: msNo,
      });
      if (!member) {
        return res.status(404).json({
          status: "error",
          message: "Member not found",
        });
      }
      let incomeType = await IncomeType.find({ type: type }).exec();
      for (let i = 0; i < incomeType.length; i++) {
        let headOfAccounts = await IncomeHeadOfAccount.find({
          type: incomeType[i]._id,
        }).exec();
        for (let headOfAccount of headOfAccounts) {
          const idString = headOfAccount._id.toString();
          if (!payment.hasOwnProperty(idString)) {
            payment[idString] = 0;
          }
        }
      }
      const createSellerPurchaser = new SellerPurchaseIncome({
        paidDate: paidDate,
        msNo: member._id,
        challanNo: challanNo,
        address: member.address,
        particular: particular,
        type: type,
        paymentDetail: payment,
        check: paymentType,
        bankAccount: bank,
        chequeNumber: chequeNumber,
      });
      const type_of_entry = "income";
      const check = paymentType;
      const paymentEntries = Object.entries(payment);
      if (paymentEntries.length > 0) {
        for (const [id, amount] of paymentEntries) {
          const headOfAccountResult = await IncomeHeadOfAccount.findOne({
            _id: id,
          }).exec();
          let name = headOfAccountResult.headOfAccount;
          if (check === "Cash") {
            const voucherNo = await VoucherNo.generateCashVoucherNo(
              req,
              res,
              type_of_entry
            );
            await CashBookLedger.createCashBookLedger(
              req,
              res,
              voucherNo,
              type_of_entry,
              name,
              particular,
              amount,
              paidDate,
              createSellerPurchaser._id
            );
            await GeneralLedger.createGeneralLedger(
              req,
              res,
              voucherNo,
              type_of_entry,
              name,
              particular,
              amount,
              paidDate,
              chequeNumber,
              challanNo,
              createSellerPurchaser._id,
              bank
            );
          } else if (check === "Bank") {
            const voucherNo = await VoucherNo.generateBankVoucherNo(
              req,
              res,
              bank,
              type_of_entry
            );
            await BankLedger.createBankLedger(
              req,
              res,
              voucherNo,
              type_of_entry,
              name,
              particular,
              amount,
              paidDate,
              chequeNumber,
              challanNo,
              createSellerPurchaser._id,
              bank
            );
            await GeneralLedger.createGeneralLedger(
              req,
              res,
              voucherNo,
              type_of_entry,
              name,
              particular,
              amount,
              paidDate,
              chequeNumber,
              challanNo,
              createSellerPurchaser._id,
              bank
            );
          }
        }
      } else {
        console.log("Payment object is empty");
      }
      await createSellerPurchaser.save();
      res.status(201).json({
        status: "success",
        message: "Seller Purchase Income created successfully",
        data: createSellerPurchaser,
      });
    } catch (err) {
      console.error("Error creating seller purchase income:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getSellerPurchaseIncome: async (req, res) => {
    const { msNo, type, id } = req.query;
    try {
      let filter = {};
      if (type) {
        filter.type = type;
      }
      if (id) {
        sellerPurchaseIncome = await SellerPurchaseIncome.findById(id)
          .populate("msNo", "msNo purchaseName")
          .exec();
        if (sellerPurchaseIncome) {
          sellerPurchaseIncome = await transformPaymentDetails(
            sellerPurchaseIncome
          );
        }
      } else {
        sellerPurchaseIncome = await SellerPurchaseIncome.find(filter)
          .populate("memberNo", "msNo purchaseName")
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
      if (
        !sellerPurchaseIncome ||
        (Array.isArray(sellerPurchaseIncome) &&
          sellerPurchaseIncome.length === 0)
      ) {
        return res
          .status(404)
          .json({ message: "Seller Purchase Income not found" });
      }
      if (msNo) {
        const filteredSellerPurchaseIncome = sellerPurchaseIncome.filter(
          (item) => item.memberNo.msNo === msNo
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
      const sellerPurchaseIncome = await SellerPurchaseIncome.findById(
        id
      ).exec();
      if (!sellerPurchaseIncome) {
        return res
          .status(404)
          .json({ message: "Seller PurchaseIncome not found" });
      }
      let updateData = {};
      if (req.body.paidDate) {
        updateData.paidDate = req.body.paidDate;
      }
      if (req.body.challanNo) {
        updateData.challanNo = req.body.challanNo;
      }
      if (req.body.particular) {
        updateData.particular = req.body.particular;
      }
      if (req.body.chequeNumber) {
        updateData.chequeNo = req.body.chequeNumber;
      }
      if (req.body.msNo) {
        const member = await Member.findOne({
          $expr: { $eq: [{ $toString: "$msNo" }, `${req.body.msNo}`] },
        });
        if (!member) {
          return res.status(404).json({ message: "Member not found" });
        }
        updateData.memberNo = member._id;
      }
      updateData = req.body;
      const type = "income";
      if (
        updateData.paymentDetail &&
        typeof updateData.paymentDetail === "object"
      ) {
        for (const [name, amount] of Object.entries(updateData.paymentDetail)) {
          let payment_type = req.body.check;
          updateData = {
            ...updateData,
            amount: amount,
          };
          if (payment_type == "Cash") {
            await CashBookLedger.updateSellerPurchaserCashLedger(
              req,
              res,
              id,
              updateData,
              type,
              name
            );
            await GeneralLedger.updateSellerPurchaserPossessionGeneralLedger(
              req,
              res,
              id,
              updateData,
              type,
              name
            );
          } else if (payment_type == "Bank") {
            await BankLedger.updateSellerPurchaserBankLedger(
              req,
              res,
              id,
              updateData,
              type,
              name
            );
            await GeneralLedger.updateSellerPurchaserPossessionGeneralLedger(
              req,
              res,
              id,
              updateData,
              type,
              name
            );
          }
        }
      }
      if (req.body.paymentDetail) {
        const paymentDetail = req.body.paymentDetail;
        const transformedPaymentDetail = {};
        for (const [name, amount] of Object.entries(paymentDetail)) {
          try {
            const headOfAccount = await IncomeHeadOfAccount.findOne({
              headOfAccount: name,
            }).exec();
            if (headOfAccount) {
              transformedPaymentDetail[headOfAccount._id] = amount;
            } else {
              console.log(`Head of Account not found for name: ${name}`);
            }
          } catch (error) {
            console.error(
              `Error retrieving Head of Account for name: ${name}`,
              error
            );
          }
        }
        updateData.paymentDetail = transformedPaymentDetail;
      }
      const updatedSellerPurchaser =
        await SellerPurchaseIncome.findByIdAndUpdate(
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
