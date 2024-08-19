const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bankLedgerSchema = new Schema({
    date:{
        type: Date,
    },
    headOfAccount:{
        type: String,
    },
    particular:{
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
    balance:{
        type: Number,
    }, 
    updateId:{
        type: String,
    },
    previousBalance:{
        type: Number,
    },
})

const BankLedger = mongoose.model('BankLedger',bankLedgerSchema)

module.exports=BankLedger;