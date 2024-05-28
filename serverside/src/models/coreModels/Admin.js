const mongoose = require('mongoose')
const schema= mongoose.Schema;
const bcrypt=require('bcryptjs');

const adminSchema = new schema({
    email:{
        type:String,
        lowercase:true,
        trim:true,
        required:true,
    },

    name:{
        type:String,
        required:true,
    },

    surname:{
        type:String,
    },

    created:{
        type:Date,
        default:Date.now
    },
    password:{
        type:String,
        required:true,
    },
    salt:{
        type:String,
        required:true,
    },
})

adminSchema.methods.generateHash = function (salt, password) {
  return bcrypt.hashSync(salt + password, 10);
};

adminSchema.methods.validPassword = function (salt, userpassword) {
  return bcrypt.compareSync(salt + userpassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;