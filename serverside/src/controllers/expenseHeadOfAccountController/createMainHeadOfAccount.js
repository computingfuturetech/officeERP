const MainHeadOfAccount=require('../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount');

module.exports={
    createHeadOfAccount: async (req, res) => {
        const {
            head_of_account,
            expense_type
        } = req.body;
        console.log(req.body)
        try {
            if (!head_of_account || !expense_type) {
              return res.status(400).json({ message: "Head of Account id required" });
            }
            const mainHeadOfAccount = new MainHeadOfAccount({
              headOfAccount: head_of_account,
              expenseType: expense_type
            });
            await mainHeadOfAccount.save();
            res.status(200).json({
              message: "Head of Account created successfully",
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
        const mainHeadOfAccount = await MainHeadOfAccount.findById(id).exec();
        if (!mainHeadOfAccount) {
          return res.status(404).json({ message: "Main Head Of Account not found" });
        }
        const updateData = {};
        if (head_of_account) {
          updateData.headOfAccount = head_of_account;
        }
        const updatedMainExpenseHeadOfAccount = await MainHeadOfAccount.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();
    
        res.status(200).json({
          message: "Main Head Of Account updated successfully",
          data: updatedMainExpenseHeadOfAccount,
        });
      } catch (err) {
        res.status(500).json({ message: err });
      }
    },
}