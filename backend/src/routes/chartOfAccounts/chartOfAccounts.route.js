const { Router } = require("express");
const authenticate = require("../../middleware/authenticate.middleware");
const authorize = require("../../middleware/authorize.middleware");
const chartOfAccountsController = require("../../controllers/chartOfAccounts/chartOfAccounts.controller");
const {
  validateAccountOnCreate,
  validateAccountOnUpdate,
} = require("../../middleware/validateChartOfAccounts.middleware");

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  validateAccountOnCreate,
  chartOfAccountsController.createAccount
);

router.patch(
  "/:id",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  validateAccountOnUpdate,
  chartOfAccountsController.updateAccount
);

router.get(
  "/",
  authenticate,
  authorize(["Super Admin", "Admin", "Employee"]),
  chartOfAccountsController.getAccounts
);

router.get(
  "/:id",
  authenticate,
  authorize(["Super Admin", "Admin", "Employee"]),
  chartOfAccountsController.getAccountById
);

router.delete(
  "/:id",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  chartOfAccountsController.deleteAccount
);

module.exports = router;
