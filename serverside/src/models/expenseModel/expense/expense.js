const mongoose = require('mongoose')
const Schema=mongoose.Schema

const expenseSchema = new Schema({
    headOfAccountAmount: [
        {
            id: { type: String },
            amount: { type: Number },
            name: { type: String }
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

const ExpenseSchema = mongoose.model('ExpenseSchema',expenseSchema)
module.exports=ExpenseSchema;