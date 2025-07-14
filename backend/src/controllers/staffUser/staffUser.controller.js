const { respondSuccess, respondFailure } = require("../../utils/res.util");
const staffUserService = require("../../services/staffUser/staffUser.service");
const commonService = require("../../services/common/common.service");
const StaffUsers = require("../../models/staffUser/staffUser.model");
const { ApiError } = require("../../utils/error.util");

async function createStaffUser(req, res) {
  try {
    const createdStaffUser = await staffUserService.createStaffUser(req.body);
    respondSuccess(
      res,
      201,
      "Staff user created successfully",
      createdStaffUser
    );
  } catch (error) {
    respondFailure(res, error);
  }
}

async function getStaffUsers(req, res) {
  try {
    const { page, limit, pagination } = req.query;
    const filters = {};
    const options = {};
    let data, meta;

    options.sort = { createdAt: -1 };
    options.projection = "-hashedPassword";

    if (pagination === "false") {
      data = await commonService.getAllDocuments(StaffUsers, filters, options);
    } else {
      options.page = page;
      options.limit = limit;
      const result = await commonService.getDocuments(
        StaffUsers,
        filters,
        options
      );
      data = result.data;
      meta = result.meta;
    }

    respondSuccess(res, 200, "Staff Users retrieved successfully", data, meta);
  } catch (error) {
    respondFailure(res, error);
  }
}

async function updateStaffUser(req, res) {
  try {
    const updatedStaffUser = await staffUserService.updateStaffUser(
      req.params.id,
      req.body
    );
    respondSuccess(
      res,
      200,
      "Staff user updated successfully",
      updatedStaffUser
    );
  } catch (error) {
    respondFailure(res, error);
  }
}

async function deleteStaffUser(req, res) {
  try {
    await staffUserService.deleteStaffUser(req.params.id);
    respondSuccess(res, 200, "Staff user deleted successfully");
  } catch (error) {
    respondFailure(res, error);
  }
}

async function loginStaffUser(req, res) {
  try {
    const data = await staffUserService.loginStaffUser(req.body);
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: Number(process.env.JWT_REFRESH_EXPIRES_IN_MS),
    });
    respondSuccess(res, 200, "Staff user login successful", data);
  } catch (error) {
    respondFailure(res, error);
  }
}

async function logoutStaffUser(req, res) {
  try {
    const { refreshToken } = req.cookies || {};
    if (!refreshToken) throw new ApiError(400, "Staff user logout failed");

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    respondSuccess(res, 200, "Staff user logout successful");
  } catch (error) {
    respondFailure(res, error);
  }
}

async function staffUserRefreshToken(req, res) {
  try {
    const { refreshToken } = req.cookies || {};
    if (!refreshToken) throw new ApiError(401, "Refresh token not provided");
    const data = await staffUserService.staffUserRefreshToken(refreshToken);
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: Number(process.env.JWT_REFRESH_EXPIRES_IN_MS),
    });
    respondSuccess(res, 200, "Staff user token refresh successful", data);
  } catch (error) {
    respondFailure(res, error);
  }
}

module.exports = {
  createStaffUser,
  getStaffUsers,
  updateStaffUser,
  deleteStaffUser,
  loginStaffUser,
  logoutStaffUser,
  staffUserRefreshToken,
};
