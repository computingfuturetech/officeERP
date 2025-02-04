const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const officeExpense = require("../../controllers/expenseController/officeExpense");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  officeExpense.createOfficeExpense
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  officeExpense.getOfficeExpense
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  officeExpense.updateOfficeExpense
);

module.exports = router;
