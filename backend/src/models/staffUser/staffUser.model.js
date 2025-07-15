const mongoose = require("mongoose");
const { STAFF_USER_ROLES, EMAIL_REGEX } = require("../../config/constants");
const { ApiError } = require("../../utils/error.util");

const staffUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, "Invalid email address"],
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: STAFF_USER_ROLES,
    },
  },
  {
    timestamps: true,
  }
);

staffUserSchema.pre("save", async function (next) {
  try {
    if (this.role === "Super Admin") {
      const superAdmin = await StaffUser.findOne({
        role: "Super Admin",
      });
      if (superAdmin)
        throw new ApiError(
          400,
          "Super admin already exists. There can only be one super admin in the system."
        );
    }
    next();
  } catch (error) {
    next(error);
  }
});

staffUserSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    if (update.role === "Super Admin") {
      const superAdmin = await StaffUser.findOne({
        role: "Super Admin",
        _id: { $ne: this.getQuery()._id },
      });
      if (superAdmin)
        throw new ApiError(
          400,
          "Super admin already exists. There can only be one super admin in the system."
        );
    }
    next();
  } catch (error) {
    next(error);
  }
});

const StaffUser = mongoose.model("StaffUser", staffUserSchema);
module.exports = StaffUser;
