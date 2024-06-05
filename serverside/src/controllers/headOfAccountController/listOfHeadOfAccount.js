const HeadOfAccount=require('../../models/headOfAccountModel/headOfAccountModel');

module.exports={
    listOfHeadOfAccount: async (req, res) => {
        try {
            const headOfAccount = await HeadOfAccount.find()
            res.status(200).json(headOfAccount);
          } catch (err) {
            res.status(500).json({ message: err });
          }
    }
}