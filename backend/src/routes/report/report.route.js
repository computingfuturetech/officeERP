const { Router } = require("express");
const authenticate = require("../../middleware/authenticate.middleware");
const authorize = require("../../middleware/authorize.middleware");
const reportController = require("../../controllers/report/report.controller");

const router = Router();

router.get(
  "/general-ledger",
  // authenticate,
  // authorize(["Admin"]),
  reportController.getGeneralLedger
);

router.get(
  "/income-statement",
  // authenticate,
  // authorize(["Admin"]),
  reportController.getIncomeStatement
);

router.get(
  "/balance-sheet",
  // authenticate,
  // authorize(["Admin"]),
  reportController.getBalanceSheet
);


module.exports = router;
