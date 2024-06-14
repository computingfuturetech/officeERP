const mongoose = require('mongoose')
const Schema = mongoose.Schema

const operatingFixedAssetsSchema = new Schema({
    date:{
        type: Date,
        default:Date.now,
    },
    building:{
        type: Number,
    },
    waterTank:{
        type: Number,
    },
    tubeWell:{
        type: Number,
    },
    furnitureAndFixture:{
        type: String,
    },
    officeEquipment:{
        type: String,
    },
    computerEquipment:{
        type: Number,
    },
    armsAndAmmuntion:{
        type: Number,
    },
    vehicles:{
        type: Number,
    },  
    tractorAndTrolly:{
        type: Number,
    },  
    transformer:{
        type: Number,
    },  
    machinery:{
        type: Number,
    },
    bankName:{
        type: Number,
    },
    total:{
        type: Number,
    },
})

const OperatingFixedAssets = mongoose.model('OperatingFixedAssets',operatingFixedAssetsSchema)

module.exports=OperatingFixedAssets;