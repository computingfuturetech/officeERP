const mongoose = require('mongoose')
const Schema=mongoose.Schema

const bankPofitSchema = new Schema({
    date:{
        type: Date,
    },
    amount:{
        type: Number,
    },
    bankName:{
        type: String,
    },
    bankAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankListSchema',
        required: true
    },
    profitMonth:{
        type: String,
    },

}
)

const BankProfitSchema = mongoose.model('BankProfitSchema',bankPofitSchema)
module.exports=BankProfitSchema;