const { respondFailure } = require("../utils/res.util");
const StaffUser = require("../models/staffUser/staffUser.model");
const { ApiError } = require("../utils/error.util");
const { STAFF_USER_ROLES, EMAIL_REGEX } = require("../config/constants");

async function validateStaffUserOnCreate(req, res, next) {
  try {
    const data = req.body;

    // validate email
    if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
      throw new ApiError(400, "Email is required");
    }
    if (!EMAIL_REGEX.test(data.email)) {
      throw new ApiError(400, "Invalid email");
    }
    const existingUser = await StaffUser.findOne({
      email: data.email,
    });
    if (existingUser) {
      throw new ApiError(
        400,
        `Staff user with email "${data.email.trim()}" already exists`
      );
    }

    // validate firstName
    if (
      !data.firstName ||
      typeof data.firstName !== "string" ||
      !data.firstName.trim()
    ) {
      throw new ApiError(400, "First name is required");
    }

    // validate password
    if (!data.password || typeof data.password !== "string") {
      throw new ApiError(400, "Password is required");
    }
    if (data.password.length < 8) {
      throw new ApiError(
        400,
        "The password needs to be at least 8 characters long"
      );
    }

    // validate role
    if (!STAFF_USER_ROLES.includes(data.role)) {
      throw new ApiError(400, "Invalid role");
    }
    next();
  } catch (error) {
    respondFailure(res, error);
  }
}

async function validateStaffUserOnUpdate(req, res, next) {
  try {
    const updateData = req.body;
    const id = req.params.id;

    // validate email
    if (updateData.email !== undefined) {
      if (!EMAIL_REGEX.test(updateData.email)) {
        throw new ApiError(400, "Invalid email");
      }
      const existingUser = await StaffUser.findOne({
        email: updateData.email,
        _id: { $ne: id },
      });
      if (existingUser) {
        throw new ApiError(
          400,
          `Staff user with email "${updateData.email.trim()}" already exists`
        );
      }
    }

    // validate first name
    if (
      updateData.firstName !== undefined &&
      (typeof updateData.firstName !== "string" ||
        updateData.firstName.trim() === "")
    ) {
      throw new ApiError(400, "First name is required");
    }

    // validate password
    if (
      updateData.password !== undefined &&
      typeof updateData.password !== "string"
    ) {
      throw new ApiError(400, "Password is required");
    }
    if (updateData.password && updateData.password.length < 8) {
      throw new ApiError(
        400,
        "The password needs to be at least 8 characters long"
      );
    }

    // validate role
    if (
      req.user?.role === "Super Admin" &&
      id === req.user?._id.toString() &&
      updateData.role !== undefined &&
      updateData.role !== "Super Admin"
    ) {
      throw new ApiError(400, "Super admin can't change its role");
    }
    if (updateData.role !== undefined) {
      if (!STAFF_USER_ROLES.includes(updateData.role)) {
        throw new ApiError(400, "Invalid role");
      }
    }
    next();
  } catch (error) {
    respondFailure(res, error);
  }
}

module.exports = {
  validateStaffUserOnCreate,
  validateStaffUserOnUpdate,
};
