const mongoose = require('mongoose')
const Schema=mongoose.Schema

const nonCurrentliablitiesSchema= new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    headOfAccount:{
        type:String,
    },
    transactionType:{
        type:String,
        default:'credit',
    },
    amount:{
        type:Number,
    }
}
)

const NonCurrentliablities = mongoose.model('NonCurrentliablities',nonCurrentliablitiesSchema)
module.exports=NonCurrentliablities;