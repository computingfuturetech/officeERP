const StaffUser = require("../../models/staffUser/staffUser.model");
const { ApiError } = require("../../utils/error.util");
const {
  generateHashedPassword,
  validatePassword,
} = require("../../utils/pass.util");
const jwt = require("jsonwebtoken");
const staffUserPermissions = require("../../config/staffUserPermissions");

async function createStaffUser(data) {
  data.hashedPassword = generateHashedPassword(data.password);
  let createdStaffUser = await StaffUser.create(data);
  createdStaffUser = createdStaffUser.toObject();
  delete createdStaffUser.hashedPassword;
  return createdStaffUser;
}

async function updateStaffUser(id, updateData) {
  delete updateData.hashedPassword;
  if (updateData.password) {
    updateData.hashedPassword = generateHashedPassword(updateData.password);
  }
  let updatedStaffUser = await StaffUser.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedStaffUser) throw new ApiError(404, "Staff user not found");
  updatedStaffUser = updatedStaffUser.toObject();
  delete updatedStaffUser.hashedPassword;
  return updatedStaffUser;
}

async function deleteStaffUser(id) {
  const deletedStaffUser = await StaffUser.findByIdAndDelete(id);
  if (!deletedStaffUser) throw new ApiError(404, "Staff user not found");
}

async function loginStaffUser({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, "Both email and password are required");
  }

  let user = await StaffUser.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isValidPassword = validatePassword(password, user.hashedPassword);
  if (!isValidPassword) throw new ApiError(401, "Invalid credentials");

  user = user.toObject();
  delete user.hashedPassword;

  const accessToken = jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN_MS }
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN_MS }
  );

  const permissions = staffUserPermissions[user.role];

  return {
    accessToken,
    refreshToken,
    user,
    permissions,
  };
}

async function staffUserRefreshToken(refreshToken) {
  return await new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        try {
          if (err) {
            return reject(new ApiError(403, "Forbidden"));
          }
          const user = await StaffUser.findById(decoded._id);
          if (!user) {
            return reject(new ApiError(403, "Forbidden"));
          }

          const accessToken = jwt.sign(
            { _id: user._id, email: user.email, role: user.role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN_MS }
          );

          const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN_MS }
          );

          resolve({
            accessToken,
            refreshToken,
          });
        } catch (error) {
          reject(new ApiError(500, "Something went wrong"));
        }
      }
    );
  });
}

module.exports = {
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
  loginStaffUser,
  staffUserRefreshToken,
};
