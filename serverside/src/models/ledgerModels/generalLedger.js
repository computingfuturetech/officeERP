const mongoose = require('mongoose')
const Schema = mongoose.Schema

const generalLedgerSchema = new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    headOfAccount:{
        type: String,
    },
    accountNumber:{
        type: Number,
    },
    particular:{
        type: String,
    },
    chequeNo:{
        type: Number,
    },
    challanNo:{
        type: Number,
    },
    voucherNo:{
        type: String,
    },
    credit:{
        type: Number,
    },  
    debit:{
        type: Number,
    },  
    amount:{
        type: Number,
    },
    type:{
        type:String,
    },
    balance:{
        type: Number,
    }, 
})

const GeneralLedger = mongoose.model('GeneralLedger',generalLedgerSchema)

module.exports=GeneralLedger;