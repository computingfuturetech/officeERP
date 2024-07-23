const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')
const HeadOfAccount=require('../../headOfAccountModel/headOfAccount')

const sellerPurchaseIncomeSchema = new Schema({
    date:{
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
    nocFee:{
        type: Number,
    },
    masjidFund:{
        type: Number,
    },
    dualOwnerFee:{
        type: Number,
    },
    coveredAreaFee:{
        type: Number,
    },
    shareMoney:{
        type: Number,
    },
    depositForLandCost:{
        type: Number,
    },
    depositForDevelopmentCharges:{
        type: Number,
    },
    additionalDevelopmentCharges:{
        type: Number,
    },
    electricityCharges:{
        type: Number,
    },

}
)

const SellerPurchaseIncomeSchema = mongoose.model('SellerPurchaseIncomeSchema',sellerPurchaseIncomeSchema)
module.exports=SellerPurchaseIncomeSchema;