const mongoose = require('mongoose')
const Schema=mongoose.Schema

const legalProfessionalExpenseSchema = new Schema({
    paidDate:{
        type: Date,
    },
    headOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HeadOfAccount',
        required: true
    },
    amount:{
        type: Number,
    },
    particulor:{
        type: String,
    },
    billingMonth:{
        type: String,
    },
}
)

const LegalProfessionalExpense = mongoose.model('LegalProfessionalExpense',legalProfessionalExpenseSchema)
module.exports=LegalProfessionalExpense;