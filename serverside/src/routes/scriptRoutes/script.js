const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const typeOfHeadOfAccount = require("../../controllers/scriptController/createTypeOfIncomeHeadOfAccount");
const incomeHeadOfAccount = require("../../controllers/scriptController/createIncomeHeadOfAccount");
const mainExpenseHeadOfAccount = require("../../controllers/scriptController/createMainExpenseHeadOfAccount");
const subExpenseHeadOfAccount = require("../../controllers/scriptController/createSubExpenseHeadOfAccount");

router.post(
  "/createPredefinedTypes",
  authenticateJWT,
  checkRole(["admin"]),
  typeOfHeadOfAccount.createPredefinedTypes
);

router.post(
  "/createIncomeHeadOfAccount",
  authenticateJWT,
  checkRole(["admin"]),
  incomeHeadOfAccount.createIncomeHeadOfAccount
);

router.post(
  "/createMainOfficeExpenseHeadOfAccount",
  authenticateJWT,
  checkRole(["admin"]),
  mainExpenseHeadOfAccount.createMainOfficeExpenseHeadOfAccount
);

router.post(
  "/createMainSiteExpenseHeadOfAccount",
  authenticateJWT,
  checkRole(["admin"]),
  mainExpenseHeadOfAccount.createMainSiteExpenseHeadOfAccount
);

router.post(
  "/createSubExpenseHeadOfAccount",
  authenticateJWT,
  checkRole(["admin"]),
  subExpenseHeadOfAccount.createSubExpenseHeadOfAccount
);

module.exports = router;
