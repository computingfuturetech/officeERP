const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const incomeHeadOfAccount = require("../../controllers/incomeHeadOfAccount/incomeHeadOfAccount");
const typeOfHeadOfAccount = require("../../controllers/incomeHeadOfAccount/typeOfHeadOfAccount");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  incomeHeadOfAccount.createHeadOfAccount
);
router.post(
  "/create/type",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  typeOfHeadOfAccount.createTypeOfHeadOfAccount
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  incomeHeadOfAccount.listOfHeadOfAccount
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  incomeHeadOfAccount.updateHeadOfAccount
);

module.exports = router;
