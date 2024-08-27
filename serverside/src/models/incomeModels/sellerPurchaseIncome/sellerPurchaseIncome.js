const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')
const HeadOfAccount=require('../../headOfAccountModel/headOfAccount')
const checkRole = require('../../../middleware/checkRole')

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
    type:{
        type: String,
    },
    paymentDetail: {
        type: Map,  
        of: Number, 
    },
    particular:{
        type: String,
    },
    chequeNo:{
        type: Number,
    },
    bankAccount:{
        type: Number,
    },
    check:{
        type: String,
    },
},
{
    timestamps: true 
}
)

const SellerPurchaseIncomeSchema = mongoose.model('SellerPurchaseIncomeSchema',sellerPurchaseIncomeSchema)
module.exports=SellerPurchaseIncomeSchema;