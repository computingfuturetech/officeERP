const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bankLedgerSchema = new Schema({
    date:{
        type: Date,
    },
    headOfAccount:{
        type: String,
    },
    particulor:{
        type: String,
    },
    accountNumber:{
        type: Number,
    },
    bankAccount:{
        type: String,
    },
    voucherNo:{
        type: String,
    },
    chequeNo:{
        type: Number,
    },
    challanNo:{
        type: Number,
    },
    credit:{
        type: Number,
    },  
    debit:{
        type: Number,
    },  
    openingBalance:{
        type: Number,
    },  
    closingBalance:{
        type: Number,
    },
    bankName:{
        type: String,
    },
})

const BankLedger = mongoose.model('BankLedger',bankLedgerSchema)

module.exports=BankLedger;