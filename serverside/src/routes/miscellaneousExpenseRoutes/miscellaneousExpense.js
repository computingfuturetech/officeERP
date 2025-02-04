const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const miscellaneousExpense = require("../../controllers/expenseController/miscellaneousExpense");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  miscellaneousExpense.createMiscellaneousExpense
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  miscellaneousExpense.getMiscellaneousExpense
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  miscellaneousExpense.updateMiscellaneousExpense
);

module.exports = router;
