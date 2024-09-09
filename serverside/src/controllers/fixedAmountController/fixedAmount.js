const FixedAmount=require('../../models/fixedAmountModel/fixedAmount');

module.exports={
    addFixedAmount: async (req, res) => {
        const {
            share_capital,bank_opening_balance,cash_opening_balance
        } = req.body;
        try {
            
            const fixedAmount = new FixedAmount({
              shareCapital: share_capital,
              cashOpeningBalance: cash_opening_balance,
              bankOpeningBalance: bank_opening_balance,
            });
            await fixedAmount.save();
            res.status(200).json({
              message: "Fixed amount added successfully",
            });
          } catch (err) {
            res.status(500).json({ message: err });
          }
    },
}