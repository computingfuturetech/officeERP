const mongoose = require('mongoose')
const Schema=mongoose.Schema

const salaryTypeSchema = new Schema({
    salaryType:{
        type: String,
    },
}
)

const SalaryTypeSchema = mongoose.model('SalaryTypeSchema',salaryTypeSchema)
module.exports=SalaryTypeSchema;