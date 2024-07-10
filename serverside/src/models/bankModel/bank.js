const mongoose = require('mongoose')
const Schema=mongoose.Schema

const bankListSchema = new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    bankName:{
        type: String,
    },
    branchName:{
        type: String,
    },
    accountNo:{
        type:String,
    },
    branchCode:{
        type:String,
    },
    accountName:{
        type:String,
    },
    accountType:{
        type:String,
    }
}
)

const BankListSchema = mongoose.model('BankListSchema',bankListSchema)
module.exports=BankListSchema;