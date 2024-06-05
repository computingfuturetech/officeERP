const mongoose = require('mongoose')
const Schema = mongoose.Schema

const generalLedgerSchema = new Schema({
    date:{
        type: Date,
    },
    headOfAccount:{
        type: String,
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
        type: Number,
    },
    credit:{
        type: Number,
    },  
    debit:{
        type: Number,
    },  
    type:{
        type:String,
        enum:['cash','bank'],
        default:'bank'
    },
})

const GeneralLedger = mongoose.model('GeneralLedger',generalLedgerSchema)

module.exports=GeneralLedger;