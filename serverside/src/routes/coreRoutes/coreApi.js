const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))
const authenticateJWT = require('../../middleware/authenticateJWT');
const checkRole = require('../../middleware/checkRole');

const coreController = require('../../controllers/userController/create')
const loginController = require('../../controllers/userController/login')
const memberController = require('../../controllers/memberController/memberFilter')
const newMemberController = require('../../controllers/memberController/newMember')
const getMemberListController = require('../../controllers/memberController/getMemberList')
const getDelistedMemberListController = require('../../controllers/memberController/getDelistedMemberList')
const transferMembershipController = require('../../controllers/memberController/transferMembership')
const updateMemberController = require('../../controllers/memberController/updateMember')
const memberDeposit = require('../../controllers/memberController/memberDeposit')
const createHeadOfAccount = require('../../controllers/headOfAccountController/createHeadOfAccount')
const listofHeadOfAccount = require('../../controllers/headOfAccountController/listOfHeadOfAccount')
const forgetPassword = require('../../controllers/userController/forgetPassword')
const otpVerify = require('../../controllers/userController/otpVerify')
const newPasswordSet = require('../../controllers/userController/newPasswordSet')
const createBank = require('../../controllers/ledgerController/createBank')
const bankList = require('../../controllers/ledgerController/bankList')
const createGeneralLedger = require('../../controllers/ledgerController/generalLedger')

router.get("/hello",coreController.get);
router.post("/create",authenticateJWT,checkRole(['admin']),coreController.create);
router.post("/login",loginController.login);
router.get('/getMemberByFilter', authenticateJWT,checkRole(['admin','employee']), memberController.getMemberByFilter);
router.post("/createMember", authenticateJWT,checkRole(['admin','employee']),newMemberController.createMember);
router.get("/getMemberList", authenticateJWT,checkRole(['admin','employee']),getMemberListController.getMemberList);
router.get("/getDelistedMemberList", authenticateJWT,checkRole(['admin','employee']),getDelistedMemberListController.getDelistedMemberList);
router.post("/transferMembership", authenticateJWT,checkRole(['admin','employee']),transferMembershipController.transferMembership);
router.post("/updateMember", authenticateJWT,checkRole(['admin','employee']),updateMemberController.updateMember);
router.post('/memberDeposit', authenticateJWT,checkRole(['admin','employee']), memberDeposit.memberDeposit);
router.post('/createHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), createHeadOfAccount.createHeadOfAccount);
router.get('/listOHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), listofHeadOfAccount.listOfHeadOfAccount);
router.post('/forgetPassword', forgetPassword.forgetPassword);
router.post('/otpVerify', otpVerify.otpVerify);
router.post('/newPasswordSet', newPasswordSet.newPasswordSet);
router.post('/addNewBank',authenticateJWT,checkRole(['admin']), createBank.createBank);
router.get('/bankList',authenticateJWT,checkRole(['admin','employee']), bankList.bankList);
router.post('/createGeneralLedger',authenticateJWT,checkRole(['admin','employee']), createGeneralLedger.createGeneralLedger);

module.exports = router