const mongoose = require('mongoose')
const Schema=mongoose.Schema

const headOfAccountSchema= new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    headOfAccount:{
        type:String,
    },
    transactionType:{
        type:String,
        enum:['debit','credit'],
    },
}
)

const HeadOfAccount = mongoose.model('HeadOfAccountr',headOfAccountSchema)
module.exports=HeadOfAccount;