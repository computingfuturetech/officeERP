const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const bankExpense = require("../../controllers/expenseController/bankChargesExpense");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankExpense.createBankChargesExpense
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankExpense.getBankChargesExpense
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankExpense.updateBankChargesExpense
);

module.exports = router;
