const mongoose = require("mongoose");
const schema = mongoose.Schema;

const forgetPaswordSchema = new schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

const ForgetPassword = mongoose.model("ForgetPassword", forgetPaswordSchema);
module.exports = ForgetPassword;
