const mongoose = require('mongoose')
const Schema=mongoose.Schema

const bankListSchema = new Schema({
    date:{
        type: Date,
    },
    bankName:{
        type: String,
    },
    accountNo:{
        type:String,
    },
    branch:{
        type:String,
    },

}
)

const BankListSchema = mongoose.model('BankListSchema',bankListSchema)
module.exports=BankListSchema;