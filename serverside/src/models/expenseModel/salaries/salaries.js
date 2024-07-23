const mongoose = require('mongoose')
const Schema=mongoose.Schema

const salariesSchema = new Schema({
    salaryType:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalaryTypeSchema',
        required: true
    },
    employeeName:{
        type:String,
    },
    amount:{
        type:Number,
    },
    date:{
        type:Date,
    },
}
)

const SalariesSchema = mongoose.model('SalariesSchema',salariesSchema)
module.exports=SalariesSchema;