const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const incomeRecordController = require("../../controllers/templateController/incomeRecord");
const singleTierchallanController = require("../../controllers/templateController/singleTierChallan");
const threeTierchallanController = require("../../controllers/templateController/threeTierChallan");
const bankLedger = require("../../controllers/templateController/bankLedgerPdf");
const generalLedger = require("../../controllers/templateController/generalLedgerPdf");
const cashLedger = require("../../controllers/templateController/cashLedgerPdf");
const balanceSheet = require("../../controllers/templateController/balanceSheet");

router.get(
  "/stc-generate-pdf",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  singleTierchallanController.generatePDF
);
router.get(
  "/ttc-generate-pdf",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  threeTierchallanController.generatePDF
);

router.get("/bank-ledger", bankLedger.generatePDF);
router.get("/general-ledger", generalLedger.generatePDF);
router.get("/cash-ledger", cashLedger.generatePDF);
router.get("/income-record", incomeRecordController.generatePDF);
router.get("/balance-sheet", balanceSheet.generatePDF);

module.exports = router;
