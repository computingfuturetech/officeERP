const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const bankBalance = require("../../controllers/bankController/bankBalance");

router.post(
  "/createBankBalance",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankBalance.createBankBalance
);

module.exports = router;
