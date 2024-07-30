const SubExpenseHeadOfAccount=require('../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount');
const MainHeadOfAccount=require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');

module.exports={

    createHeadOfAccount: async (req, res) => {
        const {
            head_of_account,
            main_head_of_account_id,
        } = req.body;
        try {
            if (!head_of_account || !main_head_of_account_id) {
              return res.status(400).json({ message: "All fields are required" });
            }

            const mainHeadOfAccount = await MainHeadOfAccount.findById(main_head_of_account_id).exec();
            if (!mainHeadOfAccount) {
                return res.status(404).json({ message: "Main Head of account not found" });
            }

            const headOfAccountArray = head_of_account.split(',').map((value) => value.trim());

            const promises = headOfAccountArray.map((headOfAccountValue) => {
              const subHeadOfAccount = new SubExpenseHeadOfAccount({
                headOfAccount: headOfAccountValue,
                mainHeadOfAccount: main_head_of_account_id
              });
              return subHeadOfAccount.save();
            });

            const subExpenseHeads = await Promise.all(promises);
            const subExpenseHeadIds = subExpenseHeads.map(head => head._id);

            const saveMainHeadOfAccount = await MainHeadOfAccount.findByIdAndUpdate(main_head_of_account_id, {
                $addToSet: {
                    subExpenseHeads: subExpenseHeadIds
                }
              });
      
            await Promise.all(promises);
            res.status(200).json({
              message: "Sub HeadOfAccount created successfully",
            });
          } catch (err) {
            res.status(500).json({ message: err });
          }
    },
    updateHeadOfAccount: async (req, res) => {
        const { head_of_account } = req.body;
        const id = req.query.id;
        try {
          if (!id) {
            return res.status(400).json({ message: "ID is required" });
          }
          const subHeadOfAccount = await SubExpenseHeadOfAccount.findById(id).exec();
          if (!subHeadOfAccount) {
            return res.status(404).json({ message: "Sub Head Of Account not found" });
          }
          const updateData = {};
          if (head_of_account) {
            updateData.headOfAccount = head_of_account;
          }
          const updatedSubExpenseHeadOfAccount = await SubExpenseHeadOfAccount.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
          ).exec();
      
          res.status(200).json({
            message: "Sub Head Of Account updated successfully",
            data: updatedSubExpenseHeadOfAccount,
          });
        } catch (err) {
          res.status(500).json({ message: err });
        }
      },
}