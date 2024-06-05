const mongoose= require('mongoose')
const BankList=require('../../models/ledgerModels/bankList')

module.exports={
  createBank: async (req, res) => {
    const {name,accountNo,branch} = req.body

      if (!name)
        return res.status(400).json({
          message: "Name is not entered.",
        });

      const result = await new BankList({
        name,
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
          name: result.name,
          accountNo: result.accountNo,
          branch: result.branch
        },
        message: 'Bank created succesfully',
      });
    },

};

  