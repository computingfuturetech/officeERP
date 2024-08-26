const mongoose = require('mongoose')
const Schema=mongoose.Schema

const liabilitiesSchema = new Schema({
    headOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncomeHeadOfAccount', 
        required: false
    },
}
)

const LiabilitiesSchema = mongoose.model('LiabilitiesSchema',liabilitiesSchema)
module.exports=LiabilitiesSchema;