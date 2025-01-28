const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const waterMaintenanceBill = require("../../controllers/incomeController/waterMaintenanceBill");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  waterMaintenanceBill.createWaterMaintenanceBill
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  waterMaintenanceBill.getWaterMaintenanceBill
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  waterMaintenanceBill.updateWaterMaintenanceBill
);

module.exports = router;
