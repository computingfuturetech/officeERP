const mongoose = require('mongoose')
const schema= mongoose.Schema;

const memberListSchema = new schema({
    srNo:{
        type: Number,
        required:true,
    },

    msNo:{
        type: Number,
        required:true,
    },

    area:{
        type: Number,
        required:true,
    },

    phase:{
        type:String,
        required:true,
    },

    purchaseName:{
        type:String,
        required:true,
    },

    address:{
        type:String,
        required:true,
    },

    cnicNo:{
        type:String,
        required:true,
    },

    plotNo:{
        type:String,
        required:true,
    },

    block:{
        type:String,
    },

})

  
const memberList = mongoose.model('memberList', memberListSchema);

module.exports = memberList;