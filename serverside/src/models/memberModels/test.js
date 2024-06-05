const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        trim:true,
    }
})

module.exports = mongoose.model('Test',schema)