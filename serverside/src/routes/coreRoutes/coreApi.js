const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))
const authenticateJWT = require('../../middleware/authenticateJWT');
const checkRole = require('../../middleware/checkRole');

const coreController = require('../../controllers/userController/create')
const loginController = require('../../controllers/userController/login')
const newMemberController = require('../../controllers/memberController/newMember')
const getMemberListController = require('../../controllers/memberController/getMemberList')
const getDelistedMemberListController = require('../../controllers/memberController/getDelistedMemberList')
const transferMembershipController = require('../../controllers/memberController/transferMembership')
const updateMemberController = require('../../controllers/memberController/updateMember')
const memberDeposit = require('../../controllers/memberController/memberDeposit')
const createHeadOfAccount = require('../../controllers/expenseHeadOfAccountController/createMainHeadOfAccount')
const createSubHeadOfAccount = require('../../controllers/expenseHeadOfAccountController/createSubHeadOfAccount')
const listofHeadOfAccount = require('../../controllers/expenseHeadOfAccountController/listOfHeadOfAccount')
const forgetPassword = require('../../controllers/userController/forgetPassword')
const otpVerify = require('../../controllers/userController/otpVerify')
const newPasswordSet = require('../../controllers/userController/newPasswordSet')
const createBank = require('../../controllers/bankController/createBank')
const bankList = require('../../controllers/bankController/bankList')
const createGeneralLedger = require('../../controllers/ledgerController/generalLedger')
const createPayableVoucher = require('../../controllers/payableVoucherController/createPayableVoucher')
const singleTierchallanController = require('../../controllers/templateController/singleTierChallan');
const threeTierchallanController = require('../../controllers/templateController/threeTierChallan');
const fixedAmountController = require('../../controllers/fixedAmountController/fixedAmount');
const bankProfit = require('../../controllers/incomeController/bankProfit')
const waterMaintenanceBill = require('../../controllers/incomeController/waterMaintenanceBill')
const possessionFee = require('../../controllers/incomeController/possessionFee')
const sellerPurchaserIncome = require('../../controllers/incomeController/sellerPurchaseIncome')
const officeUtilExpense = require('../../controllers/expenseController/officeUtilExpense')
const officeExpense = require('../../controllers/expenseController/officeExpense')
const legalProfessionalExpense = require('../../controllers/expenseController/legalProfessionalExpense')
const salaries = require('../../controllers/expenseController/salaries')
const salaryType = require('../../controllers/expenseController/salaryType')

router.get("/hello",coreController.get);
router.post("/create",authenticateJWT,checkRole(['admin']),coreController.create);
router.post("/login",loginController.login);
router.post('/forgetPassword', forgetPassword.forgetPassword);
router.post('/otpVerify', otpVerify.otpVerify);
router.post('/newPasswordSet', newPasswordSet.newPasswordSet);

router.post("/createMember", authenticateJWT,checkRole(['admin','employee']),newMemberController.createMember);
router.get("/getMemberList/", authenticateJWT,checkRole(['admin','employee']),getMemberListController.getMemberList);
router.get("/getDelistedMemberList", authenticateJWT,checkRole(['admin','employee']),getDelistedMemberListController.getDelistedMemberList);
router.post("/transferMembership", authenticateJWT,checkRole(['admin','employee']),transferMembershipController.transferMembership);
router.post("/updateMember", authenticateJWT,checkRole(['admin','employee']),updateMemberController.updateMember);
router.post('/memberDeposit', authenticateJWT,checkRole(['admin','employee']), memberDeposit.memberDeposit);

router.post('/createMainExpenseHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), createHeadOfAccount.createHeadOfAccount);
router.post('/updateMainExpenseHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), createHeadOfAccount.updateHeadOfAccount);
router.post('/createSubExpenseHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), createSubHeadOfAccount.createHeadOfAccount);
router.post('/updateSubExpenseHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), createSubHeadOfAccount.updateHeadOfAccount);
router.get('/listOHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), listofHeadOfAccount.listOfHeadOfAccount);

router.post('/addNewBank',authenticateJWT,checkRole(['admin']), createBank.createBank);
router.get('/bankList',authenticateJWT,checkRole(['admin','employee']), bankList.bankList);

router.post('/createGeneralLedger',authenticateJWT,checkRole(['admin','employee']), createGeneralLedger.createGeneralLedger);
router.post('/createPayableVoucher',authenticateJWT,checkRole(['admin','employee']), createPayableVoucher.createPayableVoucher);
router.get('/', threeTierchallanController.renderTemplate);

router.get('/stc-generate-pdf',authenticateJWT,checkRole(['admin','employee']), singleTierchallanController.generatePDF);
router.get('/ttc-generate-pdf',authenticateJWT,checkRole(['admin','employee']), threeTierchallanController.generatePDF);

router.post("/addFixedAmount",authenticateJWT,checkRole(['admin','employee']),fixedAmountController.addFixedAmount);

router.post("/createBankProfit",authenticateJWT,checkRole(['admin','employee']),bankProfit.createBankProfit);
router.get("/getBankProfit/",authenticateJWT,checkRole(['admin','employee']),bankProfit.getBankProfits);
router.post("/updateBankProfit",authenticateJWT,checkRole(['admin','employee']),bankProfit.updateBankProfit);

router.post("/createPossessionFee",authenticateJWT,checkRole(['admin','employee']),possessionFee.createPossessionFee);
router.get("/getPossessionFee/",authenticateJWT,checkRole(['admin','employee']),possessionFee.getPossessionFee);
router.post("/updatePossessionFee",authenticateJWT,checkRole(['admin','employee']),possessionFee.updatePossessionFee);

router.post("/createSellerPurchaseIncome",authenticateJWT,checkRole(['admin','employee']),sellerPurchaserIncome.createSellerPurchaseIncome);
router.post("/updateSellerPurchaseIncome",authenticateJWT,checkRole(['admin','employee']),sellerPurchaserIncome.updateSellerPurchaseIncome);
router.get("/getSellerPurchaseIncome/",authenticateJWT,checkRole(['admin','employee']),sellerPurchaserIncome.getSellerPurchaseIncome);

router.post("/createWaterMaintenanceBill",authenticateJWT,checkRole(['admin','employee']),waterMaintenanceBill.createWaterMaintenanceBill);
router.get("/getWaterMaintenanceBill/",authenticateJWT,checkRole(['admin','employee']),waterMaintenanceBill.getWaterMaintenanceBill);
router.post("/updateWaterMaintenanceBill",authenticateJWT,checkRole(['admin','employee']),waterMaintenanceBill.updateWaterMaintenanceBill);

router.post("/createOfficeUtilExpense",authenticateJWT,checkRole(['admin','employee']),officeUtilExpense.createOfficeUtilExpense);
router.get("/getOfficeUtilExpense/",authenticateJWT,checkRole(['admin','employee']),officeUtilExpense.getOfficeUtilExpense);
router.post("/updateOfficeUtilExpense",authenticateJWT,checkRole(['admin','employee']),officeUtilExpense.updateOfficeUtilExpense);

router.post("/createOfficeExpense",authenticateJWT,checkRole(['admin','employee']),officeExpense.createOfficeExpense);
router.get("/getOfficeExpense",authenticateJWT,checkRole(['admin','employee']),officeExpense.getOfficeExpense);
router.post("/updateOfficeExpense",authenticateJWT,checkRole(['admin','employee']),officeExpense.updateOfficeExpense);

router.post("/createLegalProfessionalExpense",authenticateJWT,checkRole(['admin','employee']),legalProfessionalExpense.createLegalProfessionalExpense);
router.get("/getLegalProfessionalExpense",authenticateJWT,checkRole(['admin','employee']),legalProfessionalExpense.getLegalProfessionalExpense);
router.post("/updateLegalProfessionalExpense",authenticateJWT,checkRole(['admin','employee']),legalProfessionalExpense.updateLegalProfessionalExpense);

router.post("/createSalary",authenticateJWT,checkRole(['admin','employee']),salaries.createSalaries);
router.get("/getSalary",authenticateJWT,checkRole(['admin','employee']),salaries.getSalaries);
router.post("/updateSalary",authenticateJWT,checkRole(['admin','employee']),salaries.updateSalaries);

router.post("/createSalaryType",authenticateJWT,checkRole(['admin','employee']),salaryType.createSalaryType);

module.exports = router