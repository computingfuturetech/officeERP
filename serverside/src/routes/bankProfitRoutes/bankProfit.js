const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const bankProfit = require("../../controllers/incomeController/bankProfit");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankProfit.createBankProfit
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankProfit.getBankProfits
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankProfit.updateBankProfit
);

module.exports = router;
