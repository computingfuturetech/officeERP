const mongoose = require("mongoose");
const schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const adminSchema = new schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },

  name: {
    type: String,
    trim: true,
    required: true,
  },

  surname: {
    type: String,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  salt: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
    enum: ["admin", "employee"],
  },

  created: {
    type: Date,
    default: Date.now,
  },
});

adminSchema.methods.generateHash = function (salt, password) {
  return bcrypt.hashSync(salt + password, 10);
};

adminSchema.methods.validPassword = function (salt, userpassword) {
  return bcrypt.compareSync(salt + userpassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;