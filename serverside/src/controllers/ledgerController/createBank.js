const mongoose= require('mongoose')
const BankList=require('../../models/ledgerModels/bankList')

module.exports={
  createBank: async (req, res) => {
    const {bankName,accountNo,branch} = req.body

      if (!bankName)
        return res.status(400).json({
          message: "Name is not entered.",
        });

      const result = await new BankList({
        bankName,
        accountNo,
        branch,
      }).save();

      console.log(result)
    
      
      if (!result) {
        return res.status(403).json({
          success: false,
          result: null,
          message: "Something went wrong",
        });
      }
    
      return res.status(200).send({
        success: true,
        result: {
          bankName: result.bankName,
          accountNo: result.accountNo,
          branch: result.branch
        },
        message: 'Bank created succesfully',
      });
    },

};

  