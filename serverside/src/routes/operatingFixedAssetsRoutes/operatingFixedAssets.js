const express = require("express");
const router = express.Router();
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const operatingFixedAmountController = require("../../controllers/operatingFixedAssetsController/operatingFixedAssets");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  operatingFixedAmountController.addOperatingFixedAssetsOrUpdate
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  operatingFixedAmountController.getOperatingFixedAssets
);

module.exports = router;
