const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))
const authenticateJWT = require('../../middleware/authenticateJWT');
const checkRole = require('../../middleware/checkRole');

const bankProfit = require('../../controllers/incomeController/bankProfit')
const waterMaintenanceBill = require('../../controllers/incomeController/waterMaintenanceBill')
const possessionFee = require('../../controllers/incomeController/possessionFee')
const sellerPurchaserIncome = require('../../controllers/incomeController/sellerPurchaseIncome')
const incomeHeadOfAccount = require('../../controllers/incomeHeadOfAccount/incomeHeadOfAccount')
const getAllIncome = require('../../controllers/incomeController/getAllIncome')
const typeOfHeadOfAccount = require('../../controllers/incomeHeadOfAccount/typeOfHeadOfAccount')
const income = require('../../controllers/incomeController/income')

router.post("/createBankProfit",authenticateJWT,checkRole(['admin','employee']),bankProfit.createBankProfit);
router.get("/getBankProfit/",authenticateJWT,checkRole(['admin','employee']),bankProfit.getBankProfits);
router.post("/updateBankProfit",authenticateJWT,checkRole(['admin','employee']),bankProfit.updateBankProfit);

router.post("/createPossessionFee",authenticateJWT,checkRole(['admin','employee']),possessionFee.createPossessionFee);
router.get("/getPossessionFee",authenticateJWT,checkRole(['admin','employee']),possessionFee.getPossessionFeeIncome);
router.post("/updatePossessionFee",authenticateJWT,checkRole(['admin','employee']),possessionFee.updatePossessionFee);

router.post("/createSellerPurchaseIncome",authenticateJWT,checkRole(['admin','employee']),sellerPurchaserIncome.createSellerPurchaseIncome);
router.post("/updateSellerPurchaseIncome",authenticateJWT,checkRole(['admin','employee']),sellerPurchaserIncome.updateSellerPurchaseIncome);
router.get("/getSellerPurchaseIncome/",authenticateJWT,checkRole(['admin','employee']),sellerPurchaserIncome.getSellerPurchaseIncome);

router.post("/createWaterMaintenanceBill",authenticateJWT,checkRole(['admin','employee']),waterMaintenanceBill.createWaterMaintenanceBill);
router.get("/getWaterMaintenanceBill/",authenticateJWT,checkRole(['admin','employee']),waterMaintenanceBill.getWaterMaintenanceBill);
router.post("/updateWaterMaintenanceBill",authenticateJWT,checkRole(['admin','employee']),waterMaintenanceBill.updateWaterMaintenanceBill);

router.post("/createIncomeHeadOfAccount",authenticateJWT,checkRole(['admin','employee']),incomeHeadOfAccount.createHeadOfAccount);
router.post("/createType",authenticateJWT,checkRole(['admin','employee']),typeOfHeadOfAccount.createTypeOfHeadOfAccount);
router.get("/getIncomeHeadOfAccount",authenticateJWT,checkRole(['admin','employee']),incomeHeadOfAccount.listOfHeadOfAccount);
router.post("/updateIncomeHeadOfAccount",authenticateJWT,checkRole(['admin','employee']),incomeHeadOfAccount.updateHeadOfAccount);

router.get("/getAllIncome",authenticateJWT,checkRole(['admin','employee']),getAllIncome.getAllIncome);
router.get("/getSingleIncome",authenticateJWT,checkRole(['admin','employee']),getAllIncome.getIncomeByHeadOfAccount);

router.post("/createIncomeRecord",authenticateJWT,checkRole(['admin','employee']),income.createIncomeRecord);

module.exports = router