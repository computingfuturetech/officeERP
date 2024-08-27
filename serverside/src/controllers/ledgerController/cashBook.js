const CashLedger=require('../../models/ledgerModels/cashBookLedger')

module.exports={

    getCashLedger: async (req, res) => {
        try {
            const { search, id, sortBy, sortOrder = 'asc' } = req.query;
            const query = {};
            if (search) {
                query.headOfAccount = { $regex: new RegExp(search, 'i') };
            }
            if (id) {
                query._id = id;
            }
            const sortOptions = {};
            if (sortBy) {
                sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
            }
            const cashLedgerRecords = await CashLedger.find(query).sort(sortOptions);
            res.status(200).json(cashLedgerRecords);
          } catch (err) {
            res.status(500).json({ message: err.message });
          }
    }
}