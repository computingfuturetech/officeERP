const mongoose = require('mongoose')
const Schema=mongoose.Schema

const vehicleDisposalExpenseSchema = new Schema({
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
    fuelLitre:{
        type: Number,
    },
    vehicleNumber:{
        type: Number,
    },
    vehicleType:{
        type: String,
    },
}
)

const VehicleDisposalExpenseSchema = mongoose.model('VehicleDisposalExpenseSchema',vehicleDisposalExpenseSchema)
module.exports=VehicleDisposalExpenseSchema;