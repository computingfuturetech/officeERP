const mongoose = require('mongoose')
const schema= mongoose.Schema;

const incomeStatementSchema = new schema({
    startDate:{
        type:String,
    },
    reservedFund:{
        type:Number,
    },
    surplusOfTheYear:{
        type:Number,
    },
    endDate:{
        type:String,
    },
})

const IncomeStatement = mongoose.model('IncomeStatement', incomeStatementSchema);

module.exports = IncomeStatement;