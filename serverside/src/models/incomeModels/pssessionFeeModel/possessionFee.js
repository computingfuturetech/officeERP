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
}
)

const PossessionFeeSchema = mongoose.model('PossessionFeeSchema',possessionFeeSchema)
module.exports=PossessionFeeSchema;