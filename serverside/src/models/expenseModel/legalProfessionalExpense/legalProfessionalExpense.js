const mongoose = require('mongoose')
const Schema=mongoose.Schema

const legalProfessionalExpenseSchema = new Schema({
    paidDate:{
        type: Date,
    },
    mainHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainExpenseHeadOfAccount',
    },
    subHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubExpenseHeadOfAccount',
    },
    amount:{
        type: Number,
    },
    particulor:{
        type: String,
    },
    vendor:{
        type: String,
    },
}
)

const LegalProfessionalExpense = mongoose.model('LegalProfessionalExpense',legalProfessionalExpenseSchema)
module.exports=LegalProfessionalExpense;