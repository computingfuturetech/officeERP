const mongoose = require('mongoose')
const Schema=mongoose.Schema

const miscellaneousExpenseSchema = new Schema({
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
    description:{
        type: String,
    },
    plotNumber:{
        type: String,
    },
    vendor:{
        type: String,
    },
    chequeNumber:{
        type: Number,
    },
    challanNo:{
        type: Number,
    },
    bank:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankListSchema',
    },
    check:{
        type: String,
    },
    
},
{
    timestamps: true 
}
)

const MiscellaneousExpenseSchema = mongoose.model('MiscellaneousExpenseSchema',miscellaneousExpenseSchema)
module.exports=MiscellaneousExpenseSchema;