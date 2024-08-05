const mongoose = require('mongoose')
const Schema=mongoose.Schema

const incomeHeadOfAccountSchema= new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    headOfAccount:{
        type:String,
        unique: true,
        required: true
    },
}
)

const IncomeHeadOfAccount = mongoose.model('IncomeHeadOfAccount',incomeHeadOfAccountSchema)
module.exports=IncomeHeadOfAccount;