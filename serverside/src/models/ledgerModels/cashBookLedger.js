const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cashBookSchema = new Schema({
    date:{
        type: Date,
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
    openingBalance:{
        type: Number,
    },  
    closingBalance:{
        type: Number,
    },  
})

const CashBook = mongoose.model('CashBook',cashBookSchema)

module.exports=CashBook;