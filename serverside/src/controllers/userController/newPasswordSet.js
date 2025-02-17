const Admin = require("../../models/coreModels/Admin");
const { generate: uniqueId } = require("shortid");
const bcrypt = require("bcryptjs");

module.exports = {
  newPasswordSet: async (req, res) => {
    const { password, email } = req.body;
    try {
      if (!password || !email) {
        return res.status(400).json({ message: "Both password and email are required" });
      }

      if (password.length < 8)
        return res.status(400).json({
          success: false,
          result: null,
          message: "The password needs to be at least 8 characters long",
        });

      const user = await Admin.find({
        email: email,
      });

      if (user) {
        const salt = uniqueId();
        const passwordHash = bcrypt.hashSync(salt + password);
        const updateResult = await Admin.updateOne(
          { email: email },
          {
            $set: {
              password: passwordHash,
              salt: salt,
            },
          }
        );

        if (updateResult.modifiedCount === 1) {
          res.status(200).json({
            message: "Password reset successfully",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          result: null,
          message: "User not found",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
