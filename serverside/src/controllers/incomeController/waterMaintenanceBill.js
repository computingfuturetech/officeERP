const Member = require("../../models/memberModels/memberList");
const WaterMaintenancBill = require("../../models/incomeModels/waterMaintenanceBillModel/waterMaintenanceBill");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const VoucherNo = require("../../middleware/generateVoucherNo");
const GeneralLedger = require("../../middleware/createGeneralLedger");
const BankLedger = require("../../middleware/createBankLedger");
const CashBookLedger = require("../../middleware/createCashBookLedger");
const mongoose = require("mongoose");
const { stat } = require("fs");

module.exports = {
  createWaterMaintenanceBill: async (req, res) => {
    const bills = req.body;
    try {
      if (!Array.isArray(bills) || bills.length === 0) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid input: Expected an array of water maintenance bills",
        });
      }

      const promises = bills.map(async (bill) => {
        const {
          msNo,
          referenceNo,
          billingMonth,
          amount,
          paidDate,
          plotNum,
          challanNo,
          headOfAccount,
        } = bill;

        if (
          !paidDate ||
          !msNo ||
          !referenceNo ||
          !billingMonth ||
          !amount ||
          !plotNum ||
          !headOfAccount
        ) {
          return {
            status: "error",
            message: "Missing required fields in bill entry",
          };
        }

        const incomeHeadOfAccount = await IncomeHeadOfAccount.findById(
          headOfAccount
        ).exec();
        if (!incomeHeadOfAccount) {
          return {
            status: "error",
            message: "Income head of account not found",
          };
        }
        const memberDoc = await Member.findOne({ msNo });
        if (!memberDoc) {
          return {
            status: "error",
            message: `Member with MS No ${msNo} not found`,
          };
        }

        const waterMaintenanceBill = new WaterMaintenancBill({
          paidDate: new Date(paidDate),
          msNo: memberDoc._id,
          referenceNo: parseInt(referenceNo),
          billingMonth,
          amount: parseFloat(amount),
          plotNo: plotNum,
          incomeHeadOfAccount: incomeHeadOfAccount._id,
          challanNo,
        });

        const update_id = waterMaintenanceBill._id;
        const type = "income";

        const cashVoucherNo = await VoucherNo.generateCashVoucherNo(
          req,
          res,
          type
        );

        await CashBookLedger.createCashBookLedger(
          req,
          res,
          cashVoucherNo,
          type,
          headOfAccount,
          billingMonth,
          amount,
          paidDate,
          update_id
        );

        await GeneralLedger.createGeneralLedger(
          req,
          res,
          cashVoucherNo,
          type,
          headOfAccount,
          billingMonth,
          amount,
          paidDate,
          null,
          challanNo,
          update_id,
          null
        );

        return waterMaintenanceBill.save();
      });

      const createdBills = await Promise.all(promises);

      res.status(201).json({
        status: "success",
        message: "Water Maintenance Bills created successfully",
        data: createdBills,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getWaterMaintenanceBill: async (req, res) => {
    try {
      const {
        plotNo,
        billingMonth,
        referenceNo,
        id,
        page = 1,
        limit = 10,
      } = req.query;

      if (id) {
        const waterMaintenanceBill = await WaterMaintenancBill.findById(id)
          .populate("msNo", "msNo purchaseName")
          .populate("incomeHeadOfAccount", "headOfAccount")
          .exec();
        if (!waterMaintenanceBill) {
          return res.status(404).json({
            status: "error",
            message: "Water Maintenance Bill not found",
          });
        }
        return res.status(200).json({
          status: "success",
          message: "Water Maintenance Bill found",
          data: waterMaintenanceBill,
        });
      }

      let filter = {};

      if (plotNo) {
        const plotNos = plotNo.split(",");
        filter.plotNo = { $in: plotNos };
      }

      if (billingMonth) {
        const billingMonths = billingMonth.split(",");
        filter.billingMonth = { $in: billingMonths };
      }

      if (referenceNo) {
        const referenceNos = referenceNo.split(",");
        filter.referenceNo = { $in: referenceNos };
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate: [
          {
            path: "msNo",
            select: "msNo purchaseName",
          },
          {
            path: "incomeHeadOfAccount",
            select: "headOfAccount",
          },
        ],
        sort: { createdAt: -1 },
      };

      const waterMaintenaceBill = await WaterMaintenancBill.paginate(
        filter,
        options
      );

      const listOfHeadOfAccount = await IncomeHeadOfAccount.find()
        .select("headOfAccount")
        .exec();

      return res.status(200).json({
        status: "success",
        message: "Water Maintenance Bill found",
        data: waterMaintenaceBill.docs,
        filters: {
          headOfAccount: listOfHeadOfAccount,
        },
        pagination: {
          totalDocs: waterMaintenaceBill.totalDocs,
          totalPages: waterMaintenaceBill.totalPages,
          currentPage: waterMaintenaceBill.page,
          limit: waterMaintenaceBill.limit,
          hasNextPage: waterMaintenaceBill.hasNextPage,
          hasPrevPage: waterMaintenaceBill.hasPrevPage,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateWaterMaintenanceBill: async (req, res) => {
    const id = req.query.id;
    const {
      msNo,
      referenceNo,
      billingMonth,
      amount,
      paidDate,
      plotNo,
      challanNo,
    } = req.body;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }
      const waterMaintenanceBill = await WaterMaintenancBill.findById(id)
        .populate("msNo", "msNo purchaseName")
        .populate("incomeHeadOfAccount", "headOfAccount")
        .exec();
      if (!waterMaintenanceBill) {
        return res.status(404).json({
          status: "error",
          message: "Water Maintenance Income not found",
        });
      }
      const updateData = {};
      if (paidDate) {
        updateData.paidDate = paidDate;
      }
      if (msNo) {
        const member = await Member.findOne({ msNo: msNo }).exec();
        if (!member) {
          return res.status(404).json({
            status: "error",
            message: "Member not found",
          });
        }
        updateData.msNo = member._id;
      }
      if (referenceNo) {
        updateData.referenceNo = referenceNo;
      }
      if (amount) {
        updateData.amount = amount;
      }
      if (billingMonth) {
        updateData.billingMonth = billingMonth;
      }
      if (plotNo) {
        updateData.plotNo = plotNo;
      }
      if (challanNo) {
        updateData.challanNo = challanNo;
      }
      const type = "income";
      await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
      await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
      const updatedWaterMaintenanceBill =
        await WaterMaintenancBill.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        )
          .populate("msNo", "msNo purchaseName")
          .populate("incomeHeadOfAccount", "headOfAccount")
          .exec();
      res.status(200).json({
        status: "success",
        message: "Water Maintenance Bill updated successfully",
        data: updatedWaterMaintenanceBill,
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
