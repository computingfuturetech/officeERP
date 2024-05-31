const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const delistedMemberListSchema = new Schema({
    srNo: {
        type: Number,
    },
    msNo: {
        type: String,
    },
    area: {
        type: Number,
    },
    phase: {
        type: String,

    },
    purchaseName: {
        type: String,

    },
    address: {
        type: String,
  
    },
    cnicNo: {
        type: String,
   
    },
    plotNo: {
        type: String,
    },
    block: {
        type: String,
    },
    delistedDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: 'Delisted',
    },
});

const DelistedMemberList = mongoose.model('DelistedMemberList', delistedMemberListSchema);

module.exports = DelistedMemberList;
