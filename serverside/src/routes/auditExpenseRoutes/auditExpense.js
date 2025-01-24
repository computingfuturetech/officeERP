const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const auditFee = require("../../controllers/expenseController/auditExpense");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  auditFee.createAuditFeeExpense
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  auditFee.getAuditFeeExpense
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  auditFee.updateAuditFeeExpense
);

module.exports = router;
