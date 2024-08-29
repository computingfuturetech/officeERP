const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bankLedgerSchema = new Schema({
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
    bank:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankListSchema',
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
},
{
    timestamps: true 
})

const BankLedger = mongoose.model('BankLedger',bankLedgerSchema)

module.exports=BankLedger;