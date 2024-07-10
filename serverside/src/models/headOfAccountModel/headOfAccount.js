const mongoose = require('mongoose')
const Schema=mongoose.Schema

const headOfAccountSchema= new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    headOfAccount:{
        type:String,
        unique: true,
        required: true
    },
    transactionType:{
        type:String,
        enum:['debit','credit'],
    },
}
)

const HeadOfAccount = mongoose.model('HeadOfAccount',headOfAccountSchema)
module.exports=HeadOfAccount;