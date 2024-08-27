const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')

const officeExpenseSchema = new Schema({
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
    particular:{
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
}
, {
    timestamps: true,
  });
  
  officeExpenseSchema.pre('save', function(next) {
    this.mainHeadOfAccount ? this.subHeadOfAccount = undefined : this.mainHeadOfAccount = undefined;
    next();
})

const OfficeExpense = mongoose.model('OfficeExpense',officeExpenseSchema)
module.exports=OfficeExpense;