const mongoose = require('mongoose')
const Schema=mongoose.Schema

const mainExpenseHeadOfAccountSchema= new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    headOfAccount:{
        type:String,
        unique: true,
        required: true
    },
    subExpenseHeads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubExpenseHeadOfAccount'
    }],
    expenseType:{
        type:String,
        enum:['Office Expense','Site Expense'],
        required: true
    },
}
)

const MainExpenseHeadOfAccount = mongoose.model('MainExpenseHeadOfAccount',mainExpenseHeadOfAccountSchema)
module.exports=MainExpenseHeadOfAccount;