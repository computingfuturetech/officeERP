const mongoose = require("mongoose");
const { STAFF_USER_ROLES, EMAIL_REGEX } = require("../../config/constants");

const staffUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        EMAIL_REGEX,
        "Invalid email address",
      ],
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

const StaffUser = mongoose.model("StaffUser", staffUserSchema);
module.exports = StaffUser;
