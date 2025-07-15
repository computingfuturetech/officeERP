const { Router } = require("express");
const authenticate = require("../../middleware/authenticate.middleware");
const authorize = require("../../middleware/authorize.middleware");
const staffUserController = require("../../controllers/staffUser/staffUser.controller");
const { validateStaffUserOnCreate, validateStaffUserOnUpdate } = require("../../middleware/validateStaffUser.middleware");

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["Super Admin"]),
  validateStaffUserOnCreate,
  staffUserController.createStaffUser
);

router.patch(
  "/:id",
  authenticate,
  authorize(["Super Admin"]),
  validateStaffUserOnUpdate,
  staffUserController.updateStaffUser
);

router.get(
  "/",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  staffUserController.getStaffUsers
);

router.delete(
  "/:id",
  authenticate,
  authorize(["Super Admin"]),
  staffUserController.deleteStaffUser
);

router.post(
  "/login",
  staffUserController.loginStaffUser
);

router.post(
  "/logout",
  staffUserController.logoutStaffUser
);

router.post(
  "/refresh-token",
  staffUserController.staffUserRefreshToken
);

module.exports = router;
