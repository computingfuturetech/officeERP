const mongoose= require('mongoose')
const BankLedger=require('../../models/ledgerModels/bankLedger')
const CashBook=require('../../models/ledgerModels/cashBookLedger')
const GeneralLedger=require('../../models/ledgerModels/generalLedger')
const HeadOfAccount= require('../../models/headOfAccountModel/headOfAccount')
const MemberList = require("../../models/memberModels/memberList");
const NonCurrentliablities = require("../../models/liabilitiesModel/nonCurrentLiabilities")
const PayableVoucher = require("../../models/payableVoucherModel/payableVouchers")
const CurrentLiabilities = require("../../models/liabilitiesModel/currentLiabilities")

module.exports = {
  createGeneralLedger: async (req, res) => {
    const { head_of_account, account_no, particular, cheque_no, challan_no, voucher_no, amount, type } = req.body;

    const payableVoucher = await PayableVoucher.findOne({ voucherNo: voucher_no });
    if (payableVoucher) {
      const deletePayableVoucher= await PayableVoucher.deleteOne({voucherNo:voucher_no})
      if(deletePayableVoucher)
        {
          console.log('Payablevoucher deleted')
        }
      const deleteCurrentLiabilities = await  CurrentLiabilities.deleteOne({voucherNo:voucher_no})
      if(deleteCurrentLiabilities)
        {
          console.log('CurrentLiabilities deleted')
        }
    } else {
      console.log('Not found')
    }

    try {
      if (!head_of_account ||!particular ||!type ||!voucher_no) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const headOfAccount = await HeadOfAccount.findOne({ headOfAccount: head_of_account });
      const { transactionType, headOfAccount: cHoF } = headOfAccount;

      if (transactionType === "credit") {
        await createCreditEntry(req, res, headOfAccount, amount, cHoF);
      } else if (transactionType === "debit") {
        await createDebitEntry(req, res, headOfAccount, amount);
      }
    } catch (err) {
      console.log("not_hello");
      res.status(500).json({ message: err });
    }
  },
};

async function createCreditEntry(req, res, headOfAccount, amount, cHoF) {
  const categories = ["Masjid Fund", "Deposit for Cost of Land", "Cost of Development", "Additional Development Charger", "Electricity Charges"];
  if (categories.includes(cHoF)) {
    await createNonCurrentLiabilities(headOfAccount, amount);
  }

  const generalLedger = new GeneralLedger({
    type: req.body.type,
    headOfAccount: headOfAccount.headOfAccount,
    particular: req.body.particular,
    chequeNo: req.body.cheque_no,
    challanNo: req.body.challan_no,
    voucherNo: req.body.voucher_no,
    credit: amount,
  });

  await createLedgerEntry(req, res, generalLedger, amount, "credit");
}

async function createDebitEntry(req, res, headOfAccount, amount) {

  const generalLedger = new GeneralLedger({
    type: req.body.type,
    headOfAccount: headOfAccount.headOfAccount,
    particular: req.body.particular,
    chequeNo: req.body.cheque_no,
    challanNo: req.body.challan_no,
    voucherNo: req.body.voucher_no,
    debit: amount,
  });

  await createLedgerEntry(req, res, generalLedger, amount, "debit");
}

async function createLedgerEntry(req, res, generalLedger, amount, type) {
  const OpeningBalanceOflastCashBook = await CashBook.find().sort([["_id", -1]]).limit(1);
  const OpeningBalanceOflastBankLedger = await BankLedger.find().sort([["_id", -1]]).limit(1);

  if (req.body.type === "bank") {
    const bankLedger = new BankLedger({
      voucherNo: req.body.voucher_no,
      accountNumber: req.body.account_no,
      [type]: amount,
      openingBalance: calculateOpeningBalance(OpeningBalanceOflastBankLedger, amount, type),
      headOfAccount: req.body.head_of_account,
      bank: "Allied Bank",
    });
    await bankLedger.save().then(() => console.log("bankledger saved"));
  } else if (req.body.type === "cash") {
    const cashBook = new CashBook({
      voucherNo: req.body.voucher_no,
      accountNumber: req.body.account_no,
      [type]: amount,
      openingBalance: calculateOpeningBalance(OpeningBalanceOflastCashBook, amount, type),
      headOfAccount: req.body.head_of_account,
    });
    await cashBook.save().then(() => console.log("cashbook saved"));
  }

  await generalLedger.save().then(() => console.log('General Ledger Saved'));
  res.status(200).json({ message: "Record recorded successfully" });
}

async function createNonCurrentLiabilities(headOfAccount, amount) {
  const nonCurrentLiabilities = new NonCurrentliablities({
    amount: amount,
    headOfAccount: headOfAccount.headOfAccount,
  });
  await nonCurrentLiabilities.save().then(() => console.log("nonCurrentLiabilities saved"));
}

function calculateOpeningBalance(lastLedger, amount, type) {
  if (!lastLedger.length) {
    return amount;
  }

  const lastBalance = lastLedger[0].openingBalance;
  if (lastBalance === undefined) {
    return amount;
  }

  return type === "credit"? parseInt(lastBalance) + parseInt(amount) : parseInt(lastBalance) - parseInt(amount);
}





  