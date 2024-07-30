const mongoose = require('mongoose')
const Schema=mongoose.Schema

const subExpenseHeadOfAccountSchema= new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    mainHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainExpenseHeadOfAccount',
        required: true
    },
    headOfAccount:{
        type:String,
        unique: true,
        required: true
    },
}
)

const SubExpenseHeadOfAccount = mongoose.model('SubExpenseHeadOfAccount',subExpenseHeadOfAccountSchema)
module.exports=SubExpenseHeadOfAccount;