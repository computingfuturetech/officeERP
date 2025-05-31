const Admin = require("../../models/coreModels/Admin");
const jwt = require("jsonwebtoken");

module.exports = {
  refresh: async (req, res) => {
    try {
      const cookies = req.cookies;
      if (!cookies?.refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const refreshToken = cookies.refreshToken;
      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
        async (err, decoded) => {
          try {
            if (err) {
              return res.status(403).json({ message: "Forbidden" });
            }
            const user = await Admin.findOne({
              _id: decoded.id,
            }).exec();
            if (!user) {
              return res.status(401).json({ message: "Unauthorized" });
            }
            const accessToken = jwt.sign(
              { id: user._id, email: user.email, role: user.role },
              process.env.JWT_ACCESS_SECRET,
              { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN_MS }
            );

            res.json({
              accessToken,
            });
          } catch (error) {
            res.status(500).json({ message: "Server error" });
          }
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};
