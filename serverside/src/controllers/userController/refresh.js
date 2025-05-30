const Admin = require("../../models/coreModels/Admin");
const jwt = require("jsonwebtoken");

module.exports = {
  refresh: async (req, res) => {
    try {
      const cookies = req.cookies;
      console.log(cookies);
      if (!cookies?.jwt) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const refreshToken = cookies.jwt;
      jwt.verify(
        refreshToken,
        process.env.JWT_SECRET,
        async (err, decoded) => {
          if (err) {
            return res.status(403).json({ message: "Forbidden" });
          }
          console.log(decoded);
          const user = await Admin.findOne({
            _id: decoded.id,
          }).exec();
          if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
          }
          const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );

          res.json({
            accessToken,
          });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};
