const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const siteExpense = require("../../controllers/expenseController/siteExpense");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  siteExpense.createSiteExpense
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  siteExpense.updateSiteExpense
);

module.exports = router;
