const mongoose = require('mongoose')
const Schema = mongoose.Schema

const memberDepositSchema = new Schema({
    msNo: {
        type: String,
    },
    date:{
        type: Date,
    },
    challanNo:{
        type: Number,
    },
    type:{
        type:String,
        enum:['cash','bank'],
        default:'bank'
    },
    amount:{
        type: Number,
    },
})

const MemberDeposit = mongoose.model('MemberDeposit',memberDepositSchema)

module.exports=MemberDeposit;