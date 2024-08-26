const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))
const authenticateJWT = require('../../middleware/authenticateJWT');
const checkRole = require('../../middleware/checkRole');

const bankledger = require('../../controllers/ledgerController/bankLedger')
const cashledger = require('../../controllers/ledgerController/cashBook')
const generalledger = require('../../controllers/ledgerController/generalLedger')

router.get("/getBankLedger",authenticateJWT,checkRole(['admin','employee']),bankledger.getBankLedger);
router.get("/getCashLedger",authenticateJWT,checkRole(['admin','employee']),cashledger.getCashLedger);
router.get("/getGeneralLedger",authenticateJWT,checkRole(['admin','employee']),generalledger.getGeneralLedger);

module.exports = router