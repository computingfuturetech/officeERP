const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))
const authenticateJWT = require('../../middleware/authenticateJWT');
const checkRole = require('../../middleware/checkRole');

const coreController = require('../../controllers/userController/create')
const loginController = require('../../controllers/userController/login')
const forgetPassword = require('../../controllers/userController/forgetPassword')
const otpVerify = require('../../controllers/userController/otpVerify')
const newPasswordSet = require('../../controllers/userController/newPasswordSet')

const createBank = require('../../controllers/bankController/createBank')
const bankList = require('../../controllers/bankController/bankList')
const createBankBalance = require('../../controllers/bankController/createBankBalance') 

const createGeneralLedger = require('../../controllers/ledgerController/generalLedger')
const createPayableVoucher = require('../../controllers/payableVoucherController/createPayableVoucher')

const singleTierchallanController = require('../../controllers/templateController/singleTierChallan');
const threeTierchallanController = require('../../controllers/templateController/threeTierChallan');

const bankLedger = require('../../controllers/templateController/bankLedgerPdf');
const generalLedger = require('../../controllers/templateController/generalLedgerPdf');
const cashLedger = require('../../controllers/templateController/cashLedgerPdf');

const fixedAmountController = require('../../controllers/fixedAmountController/fixedAmount');




router.get("/hello",coreController.get);
router.post("/create",authenticateJWT,checkRole(['admin']),coreController.create);
router.post("/login",loginController.login);
router.post('/forgetPassword', forgetPassword.forgetPassword);
router.post('/otpVerify', otpVerify.otpVerify);
router.post('/newPasswordSet', newPasswordSet.newPasswordSet);

router.post('/addNewBank',authenticateJWT,checkRole(['admin']), createBank.createBank);
router.get('/bankList',authenticateJWT,checkRole(['admin','employee']), bankList.bankList);
router.post('/createBankBalance',authenticateJWT,checkRole(['admin','employee']), createBankBalance.createBankBalance);

router.post('/createPayableVoucher',authenticateJWT,checkRole(['admin','employee']), createPayableVoucher.createPayableVoucher);
router.get('/', threeTierchallanController.renderTemplate);

router.get('/stc-generate-pdf',authenticateJWT,checkRole(['admin','employee']), singleTierchallanController.generatePDF);
router.get('/ttc-generate-pdf',authenticateJWT,checkRole(['admin','employee']), threeTierchallanController.generatePDF);

router.get('/bankLedgerPdf', bankLedger.generatePDF);
router.get('/generalLedgerPdf', generalLedger.generatePDF);
router.get('/cashLedgerPdf', cashLedger.generatePDF);

router.post("/addFixedAmount",authenticateJWT,checkRole(['admin','employee']),fixedAmountController.addFixedAmount);

module.exports = router