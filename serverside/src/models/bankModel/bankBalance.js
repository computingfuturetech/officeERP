const mongoose = require('mongoose')
const Schema=mongoose.Schema

const bankBalanceSchema = new Schema({
    
    balance:{
        type:Number,
    },
    bank:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankListSchema',
    },
}
)

const BankBalanceSchema = mongoose.model('BankBalanceSchema',bankBalanceSchema)
module.exports=BankBalanceSchema;