const Admin = require("../../models/coreModels/Admin");
const bcrypt = require("bcryptjs");
const { generate: uniqueId } = require("shortid");

module.exports = {
  update: async (req, res) => {
    try {
      const { id } = req.query;
      const { name, surname, email, password, role } = req.body;
      const currentUserId = req.auth?.id;
      const isSameUserRequesting = id === currentUserId;


      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "User id is required to update.",
        });
      }

      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({
          status: "error",
          message: "User not found.",
        });
      }

      if (!isSameUserRequesting && email) {
        const existingUser = await Admin.findOne({
          _id: { $ne: id, },
          email: email,
        });

        if (existingUser)
          return res.status(400).json({
            status: "error",
            message: "An account with this email already exists.",
          });
        admin.email = email;
      }

      if (password) {
        if (password.length < 8)
          return res.status(400).json({
            status: "error",
            message: "The password needs to be at least 8 characters long.",
          });

        const salt = uniqueId();
        const passwordHash = bcrypt.hashSync(salt + password);
        admin.password = passwordHash;
        admin.salt = salt;
      }

      admin.name = name || admin.name;
      admin.surname = surname || admin.surname;

      if (!isSameUserRequesting)
      admin.role = role || admin.role;

      const updatedAdmin = await admin.save();

      return res.status(200).json({
        status: "success",
        message: "User updated successfully.",
        data: {
          _id: updatedAdmin._id,
          name: updatedAdmin.name,
          surname: updatedAdmin.surname,
          email: updatedAdmin.email,
          role: updatedAdmin.role,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  },
};
