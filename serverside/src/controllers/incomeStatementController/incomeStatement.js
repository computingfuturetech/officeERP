const IncomeStatement=require('../../models/incomeStatementModel/incomeStatement');

module.exports={
    createIncomeStatement: async (req, res) => {
        const {
            start_date,end_date,reserved_fund,surplus_of_the_year
        } = req.body;
        try {
            
            const incomeStatement = new IncomeStatement({
              startDate: start_date,
              endDate: end_date,
              reservedFund: reserved_fund,
              surplusOfTheYear: surplus_of_the_year,
            });
            await incomeStatement.save();
            res.status(200).json({
              message: "Income Statement added successfully",
            });
          } catch (err) {
            res.status(500).json({ message: err });
          }
    },
}