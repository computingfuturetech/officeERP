const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')

const possessionFeeSchema = new Schema({
    paidDate:{
        type: Date,
    },
    memberNo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MemberList',
        required: true
    },
    amount:{
        type: Number,
    },
    challanNo:{
        type: Number,
    },
    headOfAccount: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncomeHeadOfAccount',
    }],
    masjidFund:{
        type: Number,
    },
    possessionFee:{
        type: Number,
    },
    buildingByLawCharges:{
        type: Number,
    },
    constructionWater:{
        type: Number,
    },
    electricityConnectionCharges:{
        type: Number,
    },
    waterConnectionCharges:{
        type: Number,
    },
}
)

const PossessionFeeSchema = mongoose.model('PossessionFeeSchema',possessionFeeSchema)
module.exports=PossessionFeeSchema;