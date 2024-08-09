const { access } = require('fs');
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const salariesSchema = new Schema({
    salaryType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalaryTypeSchema',
        required: true
    },
    mainHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainExpenseHeadOfAccount',
    },
    subHeadOfAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubExpenseHeadOfAccount',
    },
    employeeName: {
        type: String,
    },
    amount: {
        type: Number,
    },
    paidDate: {
        type: Date,
    },
    chequeNumber:{
        type: Number,
    },
    bank:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankListSchema',
    }
    
});

const SalariesSchema = mongoose.model('SalariesSchema', salariesSchema)
module.exports = SalariesSchema;