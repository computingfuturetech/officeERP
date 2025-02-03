const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const officeUtilExpense = require("../../controllers/expenseController/officeUtilExpense");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  officeUtilExpense.createOfficeUtilExpense
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  officeUtilExpense.getOfficeUtilExpense
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  officeUtilExpense.updateOfficeUtilExpense
);

module.exports = router;
