const mongoose = require('mongoose')
const Schema=mongoose.Schema

const bankChargesExpenseSchema = new Schema({
    paidDate:{
        type: Date,
    },
    mainHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainExpenseHeadOfAccount',
    },
    subHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubExpenseHeadOfAccount',
    },
    amount:{
        type: Number,
    },
    bank:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankListSchema',
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
}
)

const BankChargesExpenseSchema = mongoose.model('BankChargesExpenseSchema',bankChargesExpenseSchema)
module.exports=BankChargesExpenseSchema;