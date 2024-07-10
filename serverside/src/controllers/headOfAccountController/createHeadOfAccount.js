const HeadOfAccount=require('../../models/headOfAccountModel/headOfAccount');

module.exports={

    createHeadOfAccount: async (req, res) => {
        const {
            head_of_account,transaction_type
        } = req.body;
        console.log(req.body)
        try {
            if (!head_of_account||!transaction_type) {
              return res.status(400).json({ message: "All fields are required" });
            }
            const headOfAccount = new HeadOfAccount({
              headOfAccount: head_of_account,
              transactionType: transaction_type,
            });
            await headOfAccount.save();
            res.status(200).json({
              message: "Head of Account created successfully",
            });
          } catch (err) {
            res.status(500).json({ message: err });
          }
    },
}