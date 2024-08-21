const mongoose = require('mongoose')
const Schema=mongoose.Schema

const incomeTypeHOASchema= new Schema({
    type:{
        type:String,
        required: true
    }
}
)

const IncomeTypeHOASchema = mongoose.model('IncomeTypeHOASchema',incomeTypeHOASchema)
module.exports=IncomeTypeHOASchema;