const mongoose= require('mongoose')
const BankLedger=require('../../models/ledgerModels/bankLedger')
const CashBook=require('../../models/ledgerModels/cashBookLedger')
const GeneralLedger=require('../../models/ledgerModels/generalLedger')
const HeadOfAccount= require('../../models/headOfAccountModel/headOfAccountModel')
const MemberList = require("../../models/memberModels/memberList");



module.exports={
  createGeneralLedger: async (req, res) => {
    const {head_of_account,account_no,particular,cheque_no,challan_no,voucher_no,amount, type} = req.body
    try {
        
      if (!head_of_account||!particular||!type){
        return res.status(400).json({ message: "All fields are required" });
      }
      
      const headOfAccount = await HeadOfAccount.find({headOfAccount:head_of_account});

      if (headOfAccount[0].transactionType === "credit")
        {
            const generalLedger = new GeneralLedger({
                type: type,
                headOfAccount: head_of_account,
                particular:particular,
                chequeNo: cheque_no,
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
              let check = req.body.type;
              if (check === "bank") {
                  const bankLedger = new BankLedger({
                    voucherNo: voucher_no,
                    accountNumber: account_no,
                    credit: amount,
                    openingBalance:
                    OpeningBalanceOflastBankLedger.length === 0
                      ? amount
                      : OpeningBalanceOflastBankLedger[0].openingBalance === undefined
                      ? amount
                      : parseInt(OpeningBalanceOflastBankLedger[0].openingBalance) +
                        parseInt(amount),
                    headOfAccount:head_of_account,
                    bank: "Allied Bank",
                  });
                  await bankLedger.save().then(() => console.log("bankledger saved"));
                }
                else if (check === "cash") {
                    const bankLedger = new CashBook({
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
                      headOfAccount:head_of_account,
                      bank: "Allied Bank",
                    });
                    await CashBook.save().then(() => console.log("cashbook saved"));
                  }
                await generalLedger.save().then(()=>console.log('General Ledger Saved'));
                res.status(200).json({
                    message: "Record recorded successfully",
                });
        }
        else if (headOfAccount[0].transactionType === "debit")
            {
                const generalLedger = new GeneralLedger({
                    type: type,
                    headOfAccount: head_of_account,
                    particular:particular,
                    chequeNo: cheque_no,
                    challanNo: challan_no,
                    voucherNo: voucher_no,
                    debit: amount,
                  });
                  const OpeningBalanceOflastCashBook = await CashBook.find()
                    .sort([["_id", -1]])
                    .limit(1);
                  const OpeningBalanceOflastBankLedger = await BankLedger.find()
                    .sort([["_id", -1]])
                    .limit(1);
                  let check = req.body.type;
                  if (check === "bank") {
                      const bankLedger = new BankLedger({
                        voucherNo: voucher_no,
                        accountNumber: account_no,
                        debit: amount,
                        openingBalance:
                        OpeningBalanceOflastBankLedger.length === 0
                          ? amount
                          : OpeningBalanceOflastBankLedger[0].openingBalance === undefined
                          ? amount
                          : parseInt(OpeningBalanceOflastBankLedger[0].openingBalance) -
                            parseInt(amount),
                        headOfAccount:head_of_account,
                        bank: "Allied Bank",
                      });
                      await bankLedger.save().then(() => console.log("bankledger saved"));
                    }
                    else if (check === "cash") {
                        const bankLedger = new CashBook({
                          voucherNo: challan_no,
                          accountNumber: account_no,
                          debit: amount,
                          openingBalance:
                          OpeningBalanceOflastBankLedger.length === 0
                            ? amount
                            : OpeningBalanceOflastBankLedger[0].openingBalance === undefined
                            ? amount
                            : parseInt(OpeningBalanceOflastBankLedger[0].openingBalance) -
                              parseInt(amount),
                          headOfAccount:head_of_account,
                          bank: "Allied Bank",
                        });
                        await CashBook.save().then(() => console.log("cashbook saved"));
                      }
                    await generalLedger.save().then(()=>console.log('General Ledger Saved'));
                    res.status(200).json({
                        message: "Record recorded successfully",
                    });
            }
    } catch (err) {
        console.log("not_hello")
      res.status(500).json({ message: err });
    }
    },

};

  