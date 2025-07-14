const { Router } = require("express");
const authenticate = require("../../middleware/authenticate.middleware");
const authorize = require("../../middleware/authorize.middleware");
const staffUserController = require("../../controllers/staffUser/staffUser.controller");
const { validateStaffUserOnCreate, validateStaffUserOnUpdate } = require("../../middleware/validateStaffUser.middleware");

const router = Router();

router.post(
  "/",
  // authenticate,
  // authorize(["Admin"]),
  validateStaffUserOnCreate,
  staffUserController.createStaffUser
);

router.patch(
  "/:id",
  // authenticate,
  // authorize(["Admin"]),
  validateStaffUserOnUpdate,
  staffUserController.updateStaffUser
);

router.get(
  "/",
  // authenticate,
  // authorize(["Admin"]),
  staffUserController.getStaffUsers
);

router.delete(
  "/:id",
  // authenticate,
  // authorize(["Admin"]),
  staffUserController.deleteStaffUser
);

router.post(
  "/login",
  // authenticate,
  // authorize(["Admin"]),
  staffUserController.loginStaffUser
);

router.post(
  "/logout",
  // authenticate,
  // authorize(["Admin"]),
  staffUserController.logoutStaffUser
);

router.post(
  "/refresh-token",
  // authenticate,
  // authorize(["Admin"]),
  staffUserController.staffUserRefreshToken
);

module.exports = router;
