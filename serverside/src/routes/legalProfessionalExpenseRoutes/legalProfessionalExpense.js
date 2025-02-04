const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const legalProfessionalExpense = require("../../controllers/expenseController/legalProfessionalExpense");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  legalProfessionalExpense.createLegalProfessionalExpense
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  legalProfessionalExpense.getLegalProfessionalExpense
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  legalProfessionalExpense.updateLegalProfessionalExpense
);

module.exports = router;
