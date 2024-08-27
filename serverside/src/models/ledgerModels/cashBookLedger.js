const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cashBookSchema = new Schema({
    date:{
        type: Date,
    },
    headOfAccount:{
        type: String,
    },
    mainHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainExpenseHeadOfAccount',
    },
    subHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubExpenseHeadOfAccount',
    },
    incomeHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncomeHeadOfAccount',
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
    updateId:{
        type: String,
    }, 
    previousBalance:{
        type: Number,
    }, 
})

const CashBook = mongoose.model('CashBook',cashBookSchema)

module.exports=CashBook;