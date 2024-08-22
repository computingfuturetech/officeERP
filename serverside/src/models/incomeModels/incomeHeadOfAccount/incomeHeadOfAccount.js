const mongoose = require('mongoose')
const Schema=mongoose.Schema

const incomeHeadOfAccountSchema= new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    headOfAccount:{
        type:String,
        required: true
    },
    type:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncomeTypeHOASchema', 
        required: false
    },
}
);
incomeHeadOfAccountSchema.index({ headOfAccount: 1, type: 1 }, { unique: true });


const IncomeHeadOfAccount = mongoose.model('IncomeHeadOfAccount',incomeHeadOfAccountSchema)
module.exports=IncomeHeadOfAccount;