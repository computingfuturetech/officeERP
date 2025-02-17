const admin = require("../models/coreModels/Admin");

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.auth.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await admin.findOne({ _id: userId });

      if (!roles.includes(user.role)) {
        return res
          .status(403)
          .json({
            message: "You don't have permission to access this resource",
          });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

module.exports = checkRole;
