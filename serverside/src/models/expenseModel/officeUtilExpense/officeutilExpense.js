const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')

const officeUtilExpenseSchema = new Schema({
    paidDate:{
        type: Date,
    },
    headOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HeadOfAccount',
        required: true
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