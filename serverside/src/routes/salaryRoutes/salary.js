const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const salaries = require("../../controllers/expenseController/salaries");
const salaryType = require("../../controllers/expenseController/salaryType");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  salaries.createSalaries
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  salaries.getSalaries
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  salaries.updateSalaries
);

router.post(
  "/type/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  salaryType.createSalaryType
);

module.exports = router;
