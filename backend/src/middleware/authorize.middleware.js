const StaffUser = require("../models/staffUser/staffUser.model");
const { ApiError } = require("../utils/error.util");
const { respondFailure } = require("../utils/res.util");

const authorize = (roles) => {
  return async (req, res, next) => {
    try {
      const staffUserId = req.auth?._id;
      if (!staffUserId) {
        throw new ApiError(401, "Unauthorized");
      }

      const staffUser = await StaffUser.findById(staffUserId);
      if (!staffUser) throw new ApiError(401, "Unauthorized");

      req.user = staffUser;

      if (!roles.includes(staffUser.role)) {
        throw new ApiError(
          403,
          "You don't have permission to access this resource"
        );
      }

      next();
    } catch (error) {
      respondFailure(res, error);
    }
  };
};

module.exports = authorize;
