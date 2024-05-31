const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberListSchema = new Schema({
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
});

const MemberList = mongoose.model('MemberList', memberListSchema);

module.exports = MemberList;
