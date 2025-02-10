const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const fixedAmount = require("../../controllers/fixedAmountController/fixedAmount");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin"]),
  fixedAmount.addFixedAmountOrUpdate
);

router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  fixedAmount.getFixedAmount
);

module.exports = router;
