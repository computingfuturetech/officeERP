const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const sellerPurchaserIncome = require("../../controllers/incomeController/sellerPurchaseIncome");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  sellerPurchaserIncome.createSellerPurchaseIncome
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  sellerPurchaserIncome.updateSellerPurchaseIncome
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  sellerPurchaserIncome.getSellerPurchaseIncome
);

module.exports = router;
