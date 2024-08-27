const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')

const waterMaintenaceBillSchema = new Schema({
    memberNo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MemberList',
        required: true
    },
    plotNo:{
        type:String,
    },
    referenceNo:{
        type: Number,
    },
    billingMonth:{
        type: String,
    },
    paidDate:{
        type: Date,
    },
    amount:{
        type: Number,
    },
    incomeHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncomeHeadOfAccount',
    },
    challanNo:{
        type: String,
    }
},
{
    timestamps: true 
}
)

const WaterMaintenaceBillSchema = mongoose.model('WaterMaintenaceBillSchema',waterMaintenaceBillSchema)
module.exports=WaterMaintenaceBillSchema;