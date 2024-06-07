const mongoose= require('mongoose')
const BankList=require('../../models/ledgerModels/bankList')

module.exports={
  bankList: async (req, res) => {
    try {
        const bankList = await BankList.find();
        res.status(200).json(bankList);
      } catch (err) {
        res.status(500).json({ message: err });
      }
    },

};

  