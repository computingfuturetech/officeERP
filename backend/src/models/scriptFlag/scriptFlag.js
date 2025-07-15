const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scriptFlagSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  flag: {
    type: Boolean,
    default: false,
  },
});

const ScriptFlag = mongoose.model("ScriptFlag", scriptFlagSchema);
module.exports = ScriptFlag;
