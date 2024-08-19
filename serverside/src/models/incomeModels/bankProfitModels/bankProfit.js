const mongoose = require('mongoose')
const Schema=mongoose.Schema

const bankProfitSchema = new Schema({
    paidDate:{
        type: Date,
    },
    headOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncomeHeadOfAccount',
    },
    amount:{
        type: Number,
    },
    bank:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankListSchema',
    },
    profitMonth:{
        type: String,
    },
    chequeNo:{
        type: Number,
    },
    challanNo:{
        type: Number,
    },
}
)

const BankProfitSchema = mongoose.model('BankProfitSchema',bankProfitSchema)
module.exports=BankProfitSchema;