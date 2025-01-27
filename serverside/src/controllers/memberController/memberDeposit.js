const CashBook = require("../../models/ledgerModels/cashBookLedger");
const BankLedger = require("../../models/ledgerModels/bankLedger");
const GeneralLedger = require("../../models/ledgerModels/generalLedger");
const MemberList = require("../../models/memberModels/memberList");

module.exports = {
  memberDeposit: async (req, res) => {
    const {
      msNo,
      challanNo,
      amount,
      type,
      bank,
      particular,
      chequeNo,
      voucherNo,
    } = req.body;
    try {
      if (!msNo) {
        return res.status(400).json({
          status: "error",
          message: "Member No is required",
        });
      }
      if (!challanNo) {
        return res.status(400).json({
          status: "error",
          message: "Challan No is required",
        });
      }
      if (!amount) {
        return res.status(400).json({
          status: "error",
          message: "Amount is required",
        });
      }
      if (!type) {
        return res.status(400).json({
          status: "error",
          message: "Type is required",
        });
      }
      const memberDeposit = new MemberDeposit({
        msNo: msNo,
        challanNo: challanNo,
        amount: amount,
        type: type,
      });
      const generalLedger = new GeneralLedger({
        type: type,
        headOfAccount: "Member Deposit",
        particular: particular,
        chequeNo: chequeNo,
        challanNo: challanNo,
        voucherNo: voucherNo,
        credit: amount,
      });
      const OpeningBalanceOfLastCashBook = await CashBook.find()
        .sort([["_id", -1]])
        .limit(1);
      const OpeningBalanceOfLastBankLedger = await BankLedger.find()
        .sort([["_id", -1]])
        .limit(1);
      const memberFound = await MemberList.findOne({ msNo: msNo });
      if (!memberFound) {
        return res.status(400).json({
          status: "error",
          message: "Member not found",
        });
      }
      if (memberFound) {
        let check = req.body.type;
        if (check === "cash") {
          const cashBook = new CashBook({
            voucherNo: challanNo,
            credit: amount,
            openingBalance:
              OpeningBalanceOfLastCashBook.length === 0
                ? amount
                : OpeningBalanceOfLastCashBook[0].openingBalance === undefined
                ? amount
                : parseInt(OpeningBalanceOfLastCashBook[0].openingBalance) +
                  parseInt(amount),
          });
          await cashBook.save().then(() => console.log("saved"));
        } else if (check === "bank") {
          const bankLedger = new BankLedger({
            voucherNo: challanNo,
            accountNumber: bank,
            credit: amount,
            openingBalance:
              OpeningBalanceOfLastBankLedger.length === 0
                ? amount
                : OpeningBalanceOfLastBankLedger[0].openingBalance === undefined
                ? amount
                : parseInt(OpeningBalanceOfLastBankLedger[0].openingBalance) +
                  parseInt(amount),
            headOfAccount: "member_deposit",
            bank: "Allied Bank",
          });
          await bankLedger.save().then(() => console.log("saved"));
        }
        await memberDeposit
          .save()
          .then(() => console.log("Member Deposit Saved"));
        await generalLedger
          .save()
          .then(() => console.log("General Ledger Saved"));
      } else console.log("Not found");
      res.status(200).json({
        status: "success",
        message: "Member deposit successfully",
        data: memberDeposit,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
