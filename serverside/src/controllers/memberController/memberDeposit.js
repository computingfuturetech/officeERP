const MemberDeposit = require("../../models/memberModels/memberDeposit");
const CashBook = require("../../models/ledgerModels/cashBookLedger");
const BankLedger = require("../../models/ledgerModels/bankLedger");
const GeneralLedger = require("../../models/ledgerModels/generalLedger");
const MemberList = require("../../models/memberModels/memberList");

module.exports = {
  memberDeposit: async (req, res) => {
    const { ms_no, challan_no, amount, type, account_no , particular, checque_no,voucher_no} = req.body;
    console.log(req.body);
    try {
      if (!ms_no || !challan_no || !amount || !type) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const memberDeposit = new MemberDeposit({
        msNo: ms_no,
        challanNo: challan_no,
        amount: amount,
        type: type,
      });
      const generalLedger = new GeneralLedger({
        type: type,
        headOfAccount: "Member Deposit",
        particular:particular,
        chequeNo: checque_no,
        challanNo: challan_no,
        voucherNo: voucher_no,
        credit: amount,
      });
      const OpeningBalanceOflastCashBook = await CashBook.find()
        .sort([["_id", -1]])
        .limit(1);
      const OpeningBalanceOflastBankLedger = await BankLedger.find()
        .sort([["_id", -1]])
        .limit(1);
      const memberList = await MemberList.find({msNo: ms_no})
      if (memberList.length!=0)
        {
        let check = req.body.type;
        if (check === "cash") {
          const cashBook = new CashBook({
            voucherNo: challan_no,
            credit: amount,
            openingBalance:
            OpeningBalanceOflastCashBook.length === 0
              ? amount
              : OpeningBalanceOflastCashBook[0].openingBalance === undefined
              ? amount
              : parseInt(OpeningBalanceOflastCashBook[0].openingBalance) +
                parseInt(amount),
          });
          await cashBook.save().then(() => console.log("saved"));
        } else if (check === "bank") {
          const bankLedger = new BankLedger({
            voucherNo: challan_no,
            accountNumber: account_no,
            credit: amount,
            openingBalance:
            OpeningBalanceOflastBankLedger.length === 0
              ? amount
              : OpeningBalanceOflastBankLedger[0].openingBalance === undefined
              ? amount
              : parseInt(OpeningBalanceOflastBankLedger[0].openingBalance) +
                parseInt(amount),
            headOfAccount:"member_deposit",
            bank: "Allied Bank",
          });
          await bankLedger.save().then(() => console.log("saved"));
        }
        await memberDeposit.save().then(()=>console.log('Member Deposit Saved'));
        await generalLedger.save().then(()=>console.log('General Ledger Saved'));
        }
      else
        console.log("Not found")
      res.status(200).json({
        message: "Member deposit successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
