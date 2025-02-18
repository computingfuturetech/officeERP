const bcrypt = require("bcryptjs");
const { generate: uniqueId } = require("shortid");
const Admin = require("../../models/coreModels/Admin");

module.exports = {
  create: async (req, res) => {
    try {
      let { email, password, name, surname, role } = req.body;

      if (!email || !password)
        return res.status(400).json({
          success: false,
          result: null,
          message: "Both email and password are required",
        });

      if (!role) {
        return res.status(400).json({
          success: false,
          result: null,
          message: "Role is required",
        });
      }

      const existingUser = await Admin.findOne({
        email: email,
      });

      if (existingUser)
        return res.status(400).json({
          success: false,
          result: null,
          message: "An account with this email already exists",
        });

      if (password.length < 8)
        return res.status(400).json({
          success: false,
          result: null,
          message: "The password needs to be at least 8 characters long",
        });

      const salt = uniqueId();

      const passwordHash = bcrypt.hashSync(salt + password);

      const result = await new Admin({
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
          message: "Something went wrong",
        });
      }

      const foundUser = await Admin.findById(result._id);

      console.log(foundUser);

      return res.status(200).send({
        success: true,
        result: foundUser,
        message: "User created successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        result: null,
        message: error.message,
      });
    }
  },
};
