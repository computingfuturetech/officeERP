const mongoose = require('mongoose')
const Schema=mongoose.Schema

const incomeSchema = new Schema({
    headOfAccountAmount: [
        {
            id: { type: String },
            amount: { type: Number }
        }
    ],
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
}
)

const IncomeSchema = mongoose.model('IncomeSchema',incomeSchema)
module.exports=IncomeSchema;