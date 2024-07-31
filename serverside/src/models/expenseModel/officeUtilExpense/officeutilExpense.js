const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')

const officeUtilExpenseSchema = new Schema({
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
    billingMonth:{
        type: String,
    },
    amount:{
        type: Number,
    },
    billReference:{
        type: Number,
    },
    advTax:{
        type: Number,
    },
}
)

const OfficeUtilExpense = mongoose.model('OfficeUtilExpense',officeUtilExpenseSchema)
module.exports=OfficeUtilExpense;