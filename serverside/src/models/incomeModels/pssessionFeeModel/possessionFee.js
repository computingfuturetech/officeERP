const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')

const possessionFeeSchema = new Schema({
    date:{
        type: Date,
    },
    memberNo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MemberList',
        required: true
    },
    posessionFee:{
        type: Number,
    },
    challanNo:{
        type: Number,
    },
    electricityConnectionCharges:{
        type: Number,
    },
    waterConnectionCharges:{
        type: Number,
    },
    masjidFund:{
        type:Number,
    },
    constructionWater:{
        type: Number,
    },
    buildingBylawsCharges:{
        type: Number,
    },
    masjidFund:{
        type: Number,
    }
}
)

const PossessionFeeSchema = mongoose.model('PossessionFeeSchema',possessionFeeSchema)
module.exports=PossessionFeeSchema;