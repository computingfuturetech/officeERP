const BankLedger = require('../../models/ledgerModels/bankLedger');

module.exports = {
    getBankLedger: async (req, res) => {
        try {
            const { search, id, sortBy, sortOrder = 'asc', startDate, endDate } = req.query;
            const query = {};
            // if (search) {
            //   query.headOfAccount = { $regex: new RegExp(search, 'i') };
            // }
            // if (id) {
            //   query._id = id;
            // }
            if (startDate && endDate) {
              query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
            }
            // const sortOptions = {};
            // if (sortBy) {
            //   sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
            // }
            const bankLedgerRecords = await BankLedger.find(query).populate("bank","bankName accountNo");
            res.status(200).json(bankLedgerRecords);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
    }
};
