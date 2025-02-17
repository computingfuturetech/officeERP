const Member = require("../../models/memberModels/memberList");
const SellerPurchaseIncome = require("../../models/incomeModels/sellerPurchaseIncome/sellerPurchaseIncome");
const IncomeHeadOfAccount = require("../../models/incomeModels/incomeHeadOfAccount/incomeHeadOfAccount");
const VoucherNo = require("../../services/generateVoucherNo");
const CashBookLedger = require("../../services/createCashBookLedger");
const GeneralLedger = require("../../services/createGeneralLedger");
const BankLedger = require("../../services/createBankLedger");
const IncomeType = require("../../models/incomeModels/incomeHeadOfAccount/typeOfHeadOfAccount");
const BankList = require("../../models/bankModel/bank");

async function getIncomeType() {
  const incomeType = await IncomeType.find({}).exec();
  return incomeType;
}

module.exports = {
  createSellerPurchaseIncome: async (req, res) => {
    const { msNo, challanNo, type, paymentDetail, address } = req.body;

    try {
      if (!msNo || !type || !paymentDetail || !Array.isArray(paymentDetail)) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid request data" });
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

      let sellerPurchaseRecord = await SellerPurchaseIncome.findOne({
        msNo: member._id,
        type: type,
      });

      if (sellerPurchaseRecord) {
        return res.status(400).json({
          status: "error",
          message: "Seller Purchase Income already exists",
        });
      }

      if (!sellerPurchaseRecord) {
        // If no record exists, create a new one
        sellerPurchaseRecord = new SellerPurchaseIncome({
          msNo: member._id,
          address: member.address,
          type,
          challanNo,
          address,
          paymentDetail: [],
        });
      }

      for (const payment of paymentDetail) {
        const {
          incomeHeadOfAccount,
          paidDate,
          amount,
          check,
          particular,
          bank,
          chequeNumber,
        } = payment;

        if (!incomeHeadOfAccount || !amount || !check || !paidDate) {
          return res
            .status(400)
            .json({ status: "error", message: "Invalid payment details" });
        }

        const existingEntry = sellerPurchaseRecord.paymentDetail.find(
          (entry) =>
            entry.incomeHeadOfAccount.toString() === incomeHeadOfAccount
        );

        if (existingEntry) {
          existingEntry.amount += amount;
          existingEntry.check = check;
          existingEntry.bank = bank || existingEntry.bank;
          existingEntry.chequeNumber =
            chequeNumber || existingEntry.chequeNumber;
        } else {
          sellerPurchaseRecord.paymentDetail.push(payment);
        }

        const type_of_entry = "income";
        let voucherNo;

        if (check === "Cash") {
          voucherNo = await VoucherNo.generateCashVoucherNo(
            req,
            res,
            type_of_entry
          );
          await CashBookLedger.createCashBookLedger(
            req,
            res,
            voucherNo,
            type_of_entry,
            incomeHeadOfAccount,
            particular,
            amount,
            paidDate,
            sellerPurchaseRecord._id
          );
        } else if (check === "Bank") {
          voucherNo = await VoucherNo.generateBankVoucherNo(
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
            incomeHeadOfAccount,
            particular,
            amount,
            paidDate,
            chequeNumber,
            challanNo,
            sellerPurchaseRecord._id,
            bank
          );
        }

        await GeneralLedger.createGeneralLedger(
          req,
          res,
          voucherNo,
          type_of_entry,
          incomeHeadOfAccount,
          particular,
          amount,
          paidDate,
          chequeNumber,
          challanNo,
          sellerPurchaseRecord._id,
          bank
        );
      }

      await sellerPurchaseRecord.save();
      res.status(201).json({
        status: "success",
        message: "Seller Purchase Income updated successfully",
        data: sellerPurchaseRecord,
      });
    } catch (err) {
      console.error("Error creating/updating seller purchase income:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getSellerPurchaseIncome: async (req, res) => {
    const { type, id, page = 1, limit = 20, msNo } = req.query;

    try {
      if (id) {
        const sellerPurchaseIncome = await SellerPurchaseIncome.findById(id)
          .populate("msNo", "msNo purchaseName")
          .populate("paymentDetail.incomeHeadOfAccount", "headOfAccount")
          .populate("paymentDetail.bank", "bankName")
          .exec();

        if (!sellerPurchaseIncome) {
          return res.status(404).json({
            status: "error",
            message: "Seller Purchase Income not found",
          });
        }

        return res.status(200).json({
          status: "success",
          message: "Seller Purchase Income found",
          data: sellerPurchaseIncome,
        });
      }

      let member;

      if (msNo) {
        member = await Member.findOne({
          msNo: msNo,
        });
        if (!member) {
          return res.status(404).json({
            status: "error",
            message: "Member not found",
          });
        }
      }

      const filter = {};
      if (type) {
        filter.type = type;
      }
      if (msNo) {
        filter.msNo = member._id;
      }

      const totalRecords = await SellerPurchaseIncome.countDocuments(filter);

      const sellerPurchaseIncome = await SellerPurchaseIncome.find(filter)
        .populate("msNo", "msNo purchaseName")
        .populate("paymentDetail.incomeHeadOfAccount", "headOfAccount")
        .populate("paymentDetail.bank", "bankName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit, 10))
        .exec();

      const seller = "Seller";
      const purchase = "Purchaser";

      const type1 = await IncomeType.findOne({ type: seller }).exec();
      const type2 = await IncomeType.findOne({ type: purchase }).exec();

      const listOfSellerIncomeHeadOfAccount = await IncomeHeadOfAccount.find({
        type: type1._id,
      })
        .select("headOfAccount")
        .populate("type", "type")
        .exec();

      const listOfPurchaserIncomeHeadOfAccount = await IncomeHeadOfAccount.find(
        {
          type: type2._id,
        }
      )
        .select("headOfAccount")
        .populate("type", "type")
        .exec();

      const bankList = await BankList.find()
        .select("bankName accountNo")
        .exec();

      return res.status(200).json({
        status: "success",
        message: "Seller Purchase Income found",
        data: sellerPurchaseIncome,
        filters: {
          listOfSellerIncomeHeadOfAccount: listOfSellerIncomeHeadOfAccount,
          listOfPurchaserIncomeHeadOfAccount:
            listOfPurchaserIncomeHeadOfAccount,
          bankList: bankList,
        },
        pagination: {
          totalDocs: totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
          currentPage: parseInt(page, 10),
          limit: parseInt(limit, 10),
          hasNextPage: page * limit < totalRecords,
          hasPrevPage: page > 1,
        },
      });
    } catch (err) {
      console.error("Error fetching seller purchase income:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateSellerPurchaseIncome: async (req, res) => {
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }

      const sellerPurchaseIncome = await SellerPurchaseIncome.findById(id)
        .populate("msNo", "msNo purchaseName")
        .populate("paymentDetail.incomeHeadOfAccount", "headOfAccount")
        .populate("paymentDetail.bank", "bankName")
        .exec();

      if (!sellerPurchaseIncome) {
        return res.status(404).json({
          status: "error",
          message: "Seller Purchase Income not found",
        });
      }

      let updateData = { ...req.body };

      let member;
      if (req.body.msNo) {
        member = await Member.findOne({ msNo: req.body.msNo });
        if (!member) {
          return res.status(404).json({
            status: "error",
            message: "Member not found",
          });
        }
      }

      if (req.body.paymentDetail) {
        updateData.paymentDetail = req.body.paymentDetail.map((payment) => {
          // For Cash payments, set bank and chequeNumber to null
          if (payment.check === "Cash") {
            return {
              ...payment,
              bank: null,
              chequeNumber: null,
            };
          }
          return payment;
        });

        let transformedPaymentDetail = JSON.parse(
          JSON.stringify(sellerPurchaseIncome.paymentDetail)
        );

        for (const payment of updateData.paymentDetail) {
          const {
            paidDate,
            incomeHeadOfAccount,
            particular,
            chequeNumber,
            amount,
            check,
            bank,
          } = payment;

          // Find the Head of Account
          const headOfAccount = await IncomeHeadOfAccount.findById(
            incomeHeadOfAccount
          ).exec();
          if (!headOfAccount) {
            console.log(`Head of Account not found`);
            continue;
          }

          // Match Correctly
          let existingPayment = transformedPaymentDetail.find(
            (entry) =>
              entry.incomeHeadOfAccount._id.toString() ===
              incomeHeadOfAccount.toString()
          );

          if (existingPayment) {
            if (
              existingPayment.check === check &&
              existingPayment.amount !== amount
            ) {
              let ledgerData = {
                // incomeHeadOfAccount,
                particular,
                amount: String(amount),
                // paidDate: updateData.paidDate,
                paidDate,
              };
              if (check === "Cash") {
                await CashBookLedger.updateCashLedger(
                  req,
                  res,
                  id,
                  ledgerData,
                  "income",
                  incomeHeadOfAccount
                );
              } else if (check === "Bank") {
                const foundBank = await BankList.findById(bank).exec();
                if (!foundBank) {
                  console.log(`Bank not found`);
                  continue;
                }
                await BankLedger.updateBankLedger(
                  req,
                  res,
                  id,
                  ledgerData,
                  "income",
                  incomeHeadOfAccount
                );
              }

              await GeneralLedger.updateSellerPurchaserPossessionGeneralLedger(
                req,
                res,
                id,
                ledgerData,
                "income",
                incomeHeadOfAccount
              );
            }
          } else {
            transformedPaymentDetail.push(payment);
            let voucherNo;
            if (check === "Cash") {
              voucherNo = await VoucherNo.generateCashVoucherNo(
                req,
                res,
                "income"
              );
              await CashBookLedger.createCashBookLedger(
                req,
                res,
                voucherNo,
                "income",
                incomeHeadOfAccount,
                particular,
                amount,
                paidDate,
                id
              );
            } else if (check === "Bank") {
              voucherNo = await VoucherNo.generateBankVoucherNo(
                req,
                res,
                bank,
                "income"
              );
              await BankLedger.createBankLedger(
                req,
                res,
                voucherNo,
                "income",
                incomeHeadOfAccount,
                particular,
                amount,
                paidDate,
                chequeNumber,
                null,
                paidDate,
                id,
                bank
              );
            }

            await GeneralLedger.createGeneralLedger(
              req,
              res,
              voucherNo,
              "income",
              incomeHeadOfAccount,
              particular,
              amount,
              paidDate,
              null,
              updateData.challanNo,
              id,
              bank
            );
          }
        }

        // updateData.paymentDetail = transformedPaymentDetail;
      }

      updateData.msNo = member._id;

      const updatedSellerPurchaseIncome =
        await SellerPurchaseIncome.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Seller Purchase Income updated successfully",
        data: updatedSellerPurchaseIncome,
      });
    } catch (err) {
      console.error("Error updating seller purchase income:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
