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

router.get("/bankLedgerPdf", bankLedger.generatePDF);
router.get("/generalLedgerPdf", generalLedger.generatePDF);
router.get("/cashLedgerPdf", cashLedger.generatePDF);
router.get("/incomeRecordPdf", incomeRecordController.generatePDF);
router.get("/balanceSheetPdf", balanceSheet.generatePDF);

module.exports = router;
