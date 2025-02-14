const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const coreController = require("../../controllers/userController/create");
const getUsersController = require("../../controllers/userController/getUsers");
const updateUserController = require("../../controllers/userController/updateUser");
const loginController = require("../../controllers/userController/login");
const forgetPassword = require("../../controllers/userController/forgetPassword");
const otpVerify = require("../../controllers/userController/otpVerify");
const newPasswordSet = require("../../controllers/userController/newPasswordSet");

const createPayableVoucher = require("../../controllers/payableVoucherController/createPayableVoucher");

const threeTierchallanController = require("../../controllers/templateController/threeTierChallan");

const fixedAmountController = require("../../controllers/fixedAmountController/fixedAmount");

const operatingFixedAmountController = require("../../controllers/operatingFixedAssetsController/operatingFixedAssets");

const incomeStatement = require("../../controllers/incomeStatementController/incomeStatement");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin"]),
  coreController.create
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin"]),
  getUsersController.get
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin"]),
  updateUserController.update
);
router.post("/login", loginController.login);
router.post("/forgetPassword", forgetPassword.forgetPassword);
router.post("/otpVerify", otpVerify.otpVerify);
router.post("/newPasswordSet", newPasswordSet.newPasswordSet);

router.post(
  "/createPayableVoucher",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  createPayableVoucher.createPayableVoucher
);
router.get("/", threeTierchallanController.renderTemplate);

// router.post(
//   "/addFixedAmount",
//   authenticateJWT,
//   checkRole(["admin", "employee"]),
//   fixedAmountController.addFixedAmount
// );

router.post(
  "/addOperatingFixedAssets",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  operatingFixedAmountController.createOpertingFixedAssets
);
router.put(
  "/updateOperatingFixedAssets",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  operatingFixedAmountController.updateOperatingFixedAssets
);

router.post("/addIncomeStatement", incomeStatement.createIncomeStatement);

module.exports = router;
