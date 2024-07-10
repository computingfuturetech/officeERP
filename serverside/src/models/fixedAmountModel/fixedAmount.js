const mongoose = require('mongoose')
const schema= mongoose.Schema;

const fixedAmountSchema = new schema({
    shareCapital:{
        type:String,
        required: true,
    },
    provisionForTaxation:{
        type:String,
        required: true,
    },

})


const FixedAmount = mongoose.model('FixedAmount', fixedAmountSchema);

module.exports = FixedAmount;