const BankLedger=require('../../models/ledgerModels/bankLedger')

module.exports={

    createBankLedger:(res,req)=>{
        const {
            date,
            headOfAccount,
            particulars,
            accountNumber,
            bankAccount,
            voucherNo,
            credit,
            debit,
            openingBalance,
            closingBalance,
        } = req.body
    }
}