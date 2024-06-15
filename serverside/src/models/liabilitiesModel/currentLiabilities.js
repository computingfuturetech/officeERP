const mongoose = require('mongoose')
const Schema=mongoose.Schema

const currentliablitiesSchema= new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    headOfAccount:{
        type:String,
    },
    transactionType:{
        type:String,
        default:'debit',
    },
    voucherNo:{
        type:Number,
    },
    amount:{
        type:Number,
    }
}
)

const Currentliablities = mongoose.model('Currentliablities',currentliablitiesSchema)
module.exports=Currentliablities;