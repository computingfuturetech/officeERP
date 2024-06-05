const HeadOfAccount=require('../../models/headOfAccountModel/headOfAccountModel');

module.exports={

    createHeadOfAccount: async (req, res) => {
        const {
            head_of_account,
        } = req.body;
        console.log(req.body)
        try {
            if (!head_of_account) {
              return res.status(400).json({ message: "HeadOfAccount fields are required" });
            }
            const headOfAccount = new HeadOfAccount({
              headOfAccount: head_of_account,
            });
            await headOfAccount.save();
            res.status(200).json({
              message: "Head of Account created successfully",
            });
          } catch (err) {
            res.status(500).json({ message: err });
          }
    },
    listOfHeadOfAccount: async (req, res) => {
        const {
            head_of_account,
        } = req.body;
        try {
            const headOfAccount = HeadOfAccount.find()
            console.log(headOfAccount)
          } catch (err) {
            res.status(500).json({ message: err });
          }
    }


}