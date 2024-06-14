const mongoose = require('mongoose');
const PayableVoucher = require('../../models/payableVoucherModel/payableVouchers');
const Currentliablities = require("../../models/liabilitiesModel/currentLiabilities");
const Counter = require('../../models/counterModel/voucherCounter'); 
const HeadOfAccount = require('../../models/headOfAccountModel/headOfAccountModel');

module.exports = {
    createPayableVoucher: async (req, res) => {
      const { head_of_account, particular, cheque_no, challan_no, amount, type } = req.body;
  
      if (!head_of_account || !amount) {
        return res.status(400).json({
          message: "All fields are required.",
        });
      }
  
      let counter;
      try {
        counter = await Counter.findOne(); 
      } catch (error) {
        return res.status(500).json({
          message: "Error finding counter.",
        });
      }
  
      if (!counter) {
        counter = new Counter({ value: 0 }); 
        await counter.save();
      }
  
      let voucherNo = counter.value + 1;
      await counter.updateOne({ $inc: { value: 1 } }); 
    
      voucherNo = voucherNo.toString().padStart(4, '0');
  
      const headOfAccount = await HeadOfAccount.findOne({ headOfAccount: head_of_account });
  
      if (!headOfAccount) {
        return res.status(404).send({
          message: 'Head of account not found',
        });
      }
  
      if (headOfAccount.transactionType !== 'debit') {
        return res.status(501).send({
          success: false,
          message: 'Head of account you entered is not a debit entry',
        });
      }
  
      const payableVoucher = new PayableVoucher({
        type: type,
        headOfAccount: head_of_account,
        particular: particular,
        chequeNo: cheque_no,
        challanNo: challan_no,
        voucherNo: voucherNo,
        amount: amount,
      });
  
      await payableVoucher.save().then(() => console.log("PayableVoucher saved"));
  
      const currentLiabilities = new Currentliablities({
        headOfAccount: head_of_account,
        amount: amount,
        voucherNo:voucherNo,
      });
  
      await currentLiabilities.save().then(() => console.log("Current Liability saved"));
  
      return res.status(200).send({
        success: true,
        result: {
          headOfAccount: payableVoucher.headOfAccount,
          voucherNo: payableVoucher.voucherNo,
          amount: payableVoucher.amount
        },
        message: 'PayableVoucher created succesfully',
      });
    },
  };
  