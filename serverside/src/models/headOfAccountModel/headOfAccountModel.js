const mongoose = require('mongoose')
const Schema=mongoose.Schema

const headOfAccountSchema= new Schema({
    date:{
        type: Date,
    },
    headOfAccount:{
        type:String,
    },
}
)

const HeadOfAccount = mongoose.model('HeadOfAccountr',headOfAccountSchema)
module.exports=HeadOfAccount;