const FixedAmount=require('../../models/fixedAmountModel/fixedAmount');

module.exports={
    addFixedAmount: async (req, res) => {
        const {
            share_capital,provision_for_taxation
        } = req.body;
        console.log(req.body)
        try {
            
            const fixedAmount = new FixedAmount({
              shareCapital: share_capital,
              provisionFortaxation: provision_for_taxation,
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