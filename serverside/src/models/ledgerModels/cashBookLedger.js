const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cashBookSchema = new Schema({
    date:{
        type: Date,
    },
    headOfAccount:{
        type: String,
    },
    particular:{
        type: String,
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
    balance:{
        type: Number,
    },  
})

const CashBook = mongoose.model('CashBook',cashBookSchema)

module.exports=CashBook;