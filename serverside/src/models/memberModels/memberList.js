const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberListSchema = new Schema({
    srNo: {
        type: Number,
    },
    msNo: {
        type: String,
        required: true,
    },
    area: {
        type: Number,
    },
    phase: {
        type: String,
        required: true,
    },
    purchaseName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    cnicNo: {
        type: String,
        required: true,
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
