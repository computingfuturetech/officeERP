const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')
const HeadOfAccount=require('../../headOfAccountModel/headOfAccount')

const sellerPurchaseIncomeSchema = new Schema({
    paidDate:{
        type: Date,
    },
    memberNo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MemberList',
        required: true
    },
    challanNo:{
        type: Number,
    },
    address:{
        type:String,
    },
    headOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncomeHeadOfAccount',
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    type:{
        type: String,
    }
}
)

const SellerPurchaseIncomeSchema = mongoose.model('SellerPurchaseIncomeSchema',sellerPurchaseIncomeSchema)
module.exports=SellerPurchaseIncomeSchema;