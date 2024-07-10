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
    amount:{
        type: Number,
    },
    headOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HeadOfAccount',
        required: true
    }
}
)

const SellerPurchaseIncomeSchema = mongoose.model('SellerPurchaseIncomeSchema',sellerPurchaseIncomeSchema)
module.exports=SellerPurchaseIncomeSchema;