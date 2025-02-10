const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const bank = require("../../controllers/bankController/bank");
const bankBalance = require("../../controllers/bankController/bankBalance");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bank.createBank
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bank.getBankList
);
router.post(
  "/createBankBalance",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankBalance.createBankBalance
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bank.updateBank
);

module.exports = router;
