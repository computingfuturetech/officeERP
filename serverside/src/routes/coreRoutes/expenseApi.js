const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))
const authenticateJWT = require('../../middleware/authenticateJWT');
const checkRole = require('../../middleware/checkRole');

const officeUtilExpense = require('../../controllers/expenseController/officeUtilExpense')
const officeExpense = require('../../controllers/expenseController/officeExpense')
const legalProfessionalExpense = require('../../controllers/expenseController/legalProfessionalExpense')
const salaries = require('../../controllers/expenseController/salaries')
const salaryType = require('../../controllers/expenseController/salaryType')
const auditFee = require('../../controllers/expenseController/auditExpense')
const bankExpense = require('../../controllers/expenseController/bankChargesExpense')
const miscellaneousExpense = require('../../controllers/expenseController/miscellaneousExpense')
const electricityWaterExpense = require('../../controllers/expenseController/electricityAndWaterConnectionExpense')
const getAllExpense = require('../../controllers/expenseController/getAllExpense')
const vehicleDisposal = require('../../controllers/expenseController/vehicleDisposalExpense')
const createHeadOfAccount = require('../../controllers/expenseHeadOfAccountController/createMainHeadOfAccount')
const createSubHeadOfAccount = require('../../controllers/expenseHeadOfAccountController/createSubHeadOfAccount')
const listofHeadOfAccount = require('../../controllers/expenseHeadOfAccountController/listOfHeadOfAccount')


router.post("/createOfficeUtilExpense",authenticateJWT,checkRole(['admin','employee']),officeUtilExpense.createOfficeUtilExpense);
router.get("/getOfficeUtilExpense/",authenticateJWT,checkRole(['admin','employee']),officeUtilExpense.getOfficeUtilExpense);
router.post("/updateOfficeUtilExpense",authenticateJWT,checkRole(['admin','employee']),officeUtilExpense.updateOfficeUtilExpense);

router.post("/createOfficeExpense",authenticateJWT,checkRole(['admin','employee']),officeExpense.createOfficeExpense);
router.get("/getOfficeExpense",authenticateJWT,checkRole(['admin','employee']),officeExpense.getOfficeExpense);
router.post("/updateOfficeExpense",authenticateJWT,checkRole(['admin','employee']),officeExpense.updateOfficeExpense);

router.post("/createAuditExpense",authenticateJWT,checkRole(['admin','employee']),auditFee.createAuditFeeExpense);
router.get("/getAuditExpense",authenticateJWT,checkRole(['admin','employee']),auditFee.getAuditFeeExpense);
router.post("/updateAuditExpense",authenticateJWT,checkRole(['admin','employee']),auditFee.updateAuditFeeExpense);

router.post("/createBankExpense",authenticateJWT,checkRole(['admin','employee']),bankExpense.createBankChargesExpense);
router.get("/getBankExpense",authenticateJWT,checkRole(['admin','employee']),bankExpense.getBankChargesExpense);
router.post("/updateBankExpense",authenticateJWT,checkRole(['admin','employee']),bankExpense.updateBankChargesExpense);

router.post("/createMiscellaneousExpense",authenticateJWT,checkRole(['admin','employee']),miscellaneousExpense.createMiscellaneousExpense);
router.get("/getMiscellaneousExpense",authenticateJWT,checkRole(['admin','employee']),miscellaneousExpense.getMiscellaneousExpense);
router.post("/updateMiscellaneousExpense",authenticateJWT,checkRole(['admin','employee']),miscellaneousExpense.updateMiscellaneousExpense);

router.post("/createElectricityWaterExpense",authenticateJWT,checkRole(['admin','employee']),electricityWaterExpense.createElectricityAndWaterConnectionExpense);
router.get("/getElectricityWaterExpense",authenticateJWT,checkRole(['admin','employee']),electricityWaterExpense.getElectricityAndWaterConnectionExpense);
router.post("/updateElectricityWaterExpense",authenticateJWT,checkRole(['admin','employee']),electricityWaterExpense.updateElectricityAndWaterConnectionExpense);

router.post("/createLegalProfessionalExpense",authenticateJWT,checkRole(['admin','employee']),legalProfessionalExpense.createLegalProfessionalExpense);
router.get("/getLegalProfessionalExpense",authenticateJWT,checkRole(['admin','employee']),legalProfessionalExpense.getLegalProfessionalExpense);
router.post("/updateLegalProfessionalExpense",authenticateJWT,checkRole(['admin','employee']),legalProfessionalExpense.updateLegalProfessionalExpense);

router.post("/createSalary",authenticateJWT,checkRole(['admin','employee']),salaries.createSalaries);
router.get("/getSalary",authenticateJWT,checkRole(['admin','employee']),salaries.getSalaries);
router.post("/updateSalary",authenticateJWT,checkRole(['admin','employee']),salaries.updateSalaries);

router.post("/createVehicleDisposal",authenticateJWT,checkRole(['admin','employee']),vehicleDisposal.createVehicleDisposalExpense);
router.get("/getVehicleDisposal",authenticateJWT,checkRole(['admin','employee']),vehicleDisposal.getVehicleDisposalExpense);
router.post("/updateVehicleDisposal",authenticateJWT,checkRole(['admin','employee']),vehicleDisposal.updateVehicleDisposalExpense);

router.post("/createSalaryType",authenticateJWT,checkRole(['admin','employee']),salaryType.createSalaryType);

router.get("/getAllExpense",authenticateJWT,checkRole(['admin','employee']),getAllExpense.getAllExpense);
router.get("/getSingleExpense",authenticateJWT,checkRole(['admin','employee']),getAllExpense.getExpenseByHeadOfAccount);

router.post('/createMainExpenseHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), createHeadOfAccount.createHeadOfAccount);
router.post('/updateMainExpenseHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), createHeadOfAccount.updateHeadOfAccount);
router.post('/createSubExpenseHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), createSubHeadOfAccount.createHeadOfAccount);
router.post('/updateSubExpenseHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), createSubHeadOfAccount.updateHeadOfAccount);
router.get('/listOfHeadOfAccount', authenticateJWT,checkRole(['admin','employee']), listofHeadOfAccount.listOfHeadOfAccount);

module.exports = router