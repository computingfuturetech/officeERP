const mongoose= require('mongoose')
const bcrypt= require('bcryptjs');
const {generate: uniqueId} = require('shortid')
const admin=require('../../models/coreModels/Admin')

module.exports={
  get:(req,res)=>{
    res.send("Hello World123");
  },

  create: async (req, res) => {
    console.log("inside controller")
      let { email, password, name, surname, role } = req.body;

      if (!email || !password)
        return res.status(400).json({
          success: false,
          result: null,
          message: "Email or password fields they don't have been entered.",
        });
    
      const existingUser = await admin.findOne({
        email: email,
      });
    
      if (existingUser)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'An account with this email already exists.',
        });
    
      if (password.length < 8)
        return res.status(400).json({
          success: false,
          result: null,
          message: 'The password needs to be at least 8 characters long.',
        });
    
      const salt = uniqueId();
    
      const passwordHash = bcrypt.hashSync(salt + password);
    
      req.body.removed = false;
      const result = await new admin({
        email,
        name,
        surname,
        role,
        password: passwordHash,
        salt: salt,
      }).save();
    
      
      if (!result) {
        return res.status(403).json({
          success: false,
          result: null,
          message: "document couldn't save correctly",
        });
      }
    
      return res.status(200).send({
        success: true,
        result: {
          _id: result._id,
          email: result.email,
          name: result.name,
          surname: result.surname,
          role: result.role,
        },
        message: 'User document save correctly',
      });
    },

};

  