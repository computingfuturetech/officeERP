const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const electricityWaterExpense = require("../../controllers/expenseController/electricityAndWaterConnectionExpense");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  electricityWaterExpense.createElectricityAndWaterConnectionExpense
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  electricityWaterExpense.getElectricityAndWaterConnectionExpense
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  electricityWaterExpense.updateElectricityAndWaterConnectionExpense
);

module.exports = router;
