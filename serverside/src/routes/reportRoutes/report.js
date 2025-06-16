const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const incomeRecordController = require("../../controllers/templateController/incomeRecord");
const incomeRecordCsv = require("../../controllers/templateController/incomeRecordCsv");
const singleTierchallanController = require("../../controllers/templateController/singleTierChallan");
const threeTierchallanController = require("../../controllers/templateController/threeTierChallan");
const bankLedger = require("../../controllers/templateController/bankLedgerPdf");
const bankLedgerCsv = require("../../controllers/templateController/bankLedgerCsv");
const generalLedger = require("../../controllers/templateController/generalLedgerPdf");
const generalLedgerCsv = require("../../controllers/templateController/generalLedgerCsv");
const cashLedger = require("../../controllers/templateController/cashLedgerPdf");
const cashLedgerCsv = require("../../controllers/templateController/cashLedgerCsv");
const balanceSheet = require("../../controllers/templateController/balanceSheet");
const balanceSheetCsv = require("../../controllers/templateController/balanceSheetCsv");

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

router.get(
  "/bank-ledger/pdf",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankLedger.generatePDF
);
router.get(
  "/bank-ledger/csv",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  bankLedgerCsv.generateCSV
);
router.get(
  "/general-ledger/pdf",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  generalLedger.generatePDF
);
router.get(
  "/general-ledger/csv",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  generalLedgerCsv.generateCSV
);
router.get(
  "/cash-ledger/pdf",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  cashLedger.generatePDF
);
router.get(
  "/cash-ledger/csv",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  cashLedgerCsv.generateCSV
);
router.get(
  "/income-record/pdf",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  incomeRecordController.generatePDF
);
router.get(
  "/income-record/csv",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  incomeRecordCsv.generateCSV
);
router.get(
  "/balance-sheet/pdf",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  balanceSheet.generatePDF
);
router.get(
  "/balance-sheet/csv",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  balanceSheetCsv.generateCSV
);

module.exports = router;
