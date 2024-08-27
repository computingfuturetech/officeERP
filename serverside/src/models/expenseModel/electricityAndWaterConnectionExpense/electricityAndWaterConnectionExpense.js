const mongoose = require('mongoose')
const Schema=mongoose.Schema
const Member=require('../../memberModels/memberList')

const electricityWaterExpenseSchema = new Schema({
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
  
  electricityWaterExpenseSchema.pre('save', function(next) {
    this.mainHeadOfAccount ? this.subHeadOfAccount = undefined : this.mainHeadOfAccount = undefined;
    next();
})

const ElectricityWaterExpenseSchema = mongoose.model('ElectricityWaterExpenseSchema',electricityWaterExpenseSchema)
module.exports=ElectricityWaterExpenseSchema;
