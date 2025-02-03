const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const expenseHeadOfAccount = require("../../controllers/expenseHeadOfAccountController/headOfAccount");

router.post(
  "/main/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  expenseHeadOfAccount.createMainHeadOfAccount
);
router.post(
  "/main/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  expenseHeadOfAccount.updateMainHeadOfAccount
);
router.post(
  "/sub/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  expenseHeadOfAccount.createSubHeadOfAccount
);
router.post(
  "/sub/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  expenseHeadOfAccount.updateSubHeadOfAccount
);
router.get(
  "/list",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  expenseHeadOfAccount.listOfHeadOfAccount
);

module.exports = router;
