const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')

const officeExpenseSchema = new Schema({
    paidDate:{
        type: Date,
    },
    headOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HeadOfAccount',
        required: true
    },
    amount:{
        type: Number,
    },
    particulor:{
        type: String,
    },
    vendor:{
        type: String,
    },
}
)

const OfficeExpense = mongoose.model('OfficeExpense',officeExpenseSchema)
module.exports=OfficeExpense;