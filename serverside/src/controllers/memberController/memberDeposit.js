const MemberDeposit = require("../../models/memberModels/memberDeposit");
const CashBook = require("../../models/ledgerModels/cashBookLedger");
const BankLedger = require("../../models/ledgerModels/bankLedger");
const GeneralLedger = require("../../models/ledgerModels/generalLedger");

module.exports = {
  memberDeposit: async (req, res) => {
    const { ms_no, challan_no, amount, type, account_no } = req.body;
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
      console.log(CashBook.openingBalance);
      const OpeningBalanceOflastCashBook = await CashBook.find()
        .sort([["_id", -1]])
        .limit(1);
      const OpeningBalanceOflastBankLedger = await BankLedger.find()
        .sort([["_id", -1]])
        .limit(1);
        console.log(`Opening Balance: ${OpeningBalanceOflastBankLedger[0].openingBalance}`)
      console.log(OpeningBalanceOflastCashBook[0].openingBalance);
      let check = req.body.type;
      if (check === "cash") {
        console.log(req.body.type);
        const cashBook = new CashBook({
          voucherNo: challan_no,
          credit: amount,
          openingBalance: OpeningBalanceOflastCashBook[0].openingBalance === undefined ? amount: (
            parseInt(OpeningBalanceOflastCashBook[0].openingBalance) +
            parseInt(amount)),
        });
        await cashBook.save().then(() => console.log("saved"));
      } else if (check === "bank") {
        console.log("bank",req.body.type);
        const bankLedger = new BankLedger({
          voucherNo: challan_no,
          accountNumber: account_no,
          credit: amount,
          openingBalance: OpeningBalanceOflastBankLedger[0].openingBalance === undefined ? amount: (
            parseInt(OpeningBalanceOflastBankLedger[0].openingBalance) +
            parseInt(amount)),
          headOfAccount:"member_deposit",
          bank: "Allied Bank",
        });
        console.log(`Bank Ledger = ${bankLedger}`);
        await bankLedger.save().then(() => console.log("saved"));
      }
      await memberDeposit.save().then(()=>console.log('Member Saved'));
      res.status(200).json({
        message: "Member deposit successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
};
