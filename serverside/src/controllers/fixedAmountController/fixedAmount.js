const FixedAmount = require("../../models/fixedAmountModel/fixedAmount");

module.exports = {
  addFixedAmountOrUpdate: async (req, res) => {
    const { shareCapital, cashOpeningBalance } = req.body;

    try {
      let fixedAmount = await FixedAmount.findOne();

      if (fixedAmount) {
        if (shareCapital) fixedAmount.shareCapital = shareCapital;
        // if (bankOpeningBalance)
        //   fixedAmount.bankOpeningBalance = bankOpeningBalance;
        if (cashOpeningBalance)
          fixedAmount.cashOpeningBalance = cashOpeningBalance;

        await fixedAmount.save();
        return res.status(200).json({
          status: "success",
          message: "Fixed amount updated successfully",
          data: fixedAmount,
        });
      }

      fixedAmount = new FixedAmount({
        shareCapital,
        // bankOpeningBalance,
        cashOpeningBalance,
      });

      await fixedAmount.save();
      return res.status(201).json({
        status: "success",
        message: "Fixed amount created successfully",
        data: fixedAmount,
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  },

  getFixedAmount: async (req, res) => {
    try {
      const fixedAmount = await FixedAmount.findOne();

      return res.status(200).json({
        status: "success",
        data: fixedAmount,
      });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ status: "error", message: err.message });
    }
  },
};
