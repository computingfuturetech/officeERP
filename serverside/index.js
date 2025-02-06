const express = require("express");
require("./src/config/config");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const app = express();

// New Routes
const bankRouter = require("./src/routes/bankRoutes/bank");
const bankBalanceRouter = require("./src/routes/bankBalanceRoutes/bankBalance");
const auditExpenseRouter = require("./src/routes/auditExpenseRoutes/auditExpense");
const bankChargesExpenseRouter = require("./src/routes/bankChargesExpenseRoutes/bankChargesExpense");
const memberRouter = require("./src/routes/memberRoutes/member");
const bankProfitRouter = require("./src/routes/bankProfitRoutes/bankProfit");
const waterMaintenaceBillRouter = require("./src/routes/waterMaintenanceBillRoutes/waterMaintenanceBill");
const sellerPurchaserRouter = require("./src/routes/sellerPurchaserRoutes/sellerPurchaser");
const incomeHeadOfAccountRouter = require("./src/routes/incomeHeadOfAccountRoutes/incomeHeadOfAccount");
const officeUtilExpenseRouter = require("./src/routes/officeUtilExpenseRoutes/officeUtilExpense");
const salaryRouter = require("./src/routes/salaryRoutes/salary");
const expenseHeadOfAccountRouter = require("./src/routes/expenseHeadOfAccountRoutes/expenseHeadOfAccount");
const vehicleDisposalExpenseRouter = require("./src/routes/vehicleDisposalExpenseRoutes/vehicleDisposalExpense");
const siteExpenseRouter = require("./src/routes/siteExpenseRoutes/siteExpense");

dotenv.config();

const coreRouter = require("./src/routes/coreRoutes/coreApi");
const incomeRouter = require("./src/routes/coreRoutes/incomeApi");
const expenseRouter = require("./src/routes/coreRoutes/expenseApi");
// const memberRouter = require("./src/routes/coreRoutes/memberApi");
const fixedAmountRouter = require("./src/routes/coreRoutes/fixedAmountApi");
const liabilityRouter = require("./src/routes/coreRoutes/liability");
const ledgerRouter = require("./src/routes/coreRoutes/ledgerApi");
const officeExpenseRouter = require("./src/routes/officeExpenseRoutes/officeExpense");
const legalProfessionalExpenseRouter = require("./src/routes/legalProfessionalExpenseRoutes/legalProfessionalExpense");
const miscellaneousExpenseRouter = require("./src/routes/miscellaneousExpenseRoutes/miscellaneousExpense");
const electricityAndWaterConnectionExpenseRouter = require("./src/routes/electricityWaterRoutes/electricityWater");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
const upload = multer();

app.use(upload.none());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/user", coreRouter);
app.use("/user", incomeRouter);
app.use("/user", expenseRouter);
app.use("/user", memberRouter);
app.use("/user", fixedAmountRouter);
app.use("/user", liabilityRouter);
app.use("/user", ledgerRouter);

// Routes Starting Point
app.use("/bank", bankRouter);
app.use("/bank", bankBalanceRouter);
app.use("/auditExpense", auditExpenseRouter);
app.use("/bankChargesExpense", bankChargesExpenseRouter);
app.use("/member", memberRouter);
app.use("/bankProfit", bankProfitRouter);
app.use("/waterMaintenanceBill", waterMaintenaceBillRouter);
app.use("/sellerPurchaser", sellerPurchaserRouter);
app.use("/incomeHeadOfAccount", incomeHeadOfAccountRouter);
app.use("/officeUtilExpense", officeUtilExpenseRouter);
app.use("/salary", salaryRouter);
app.use("/expenseHeadOfAccount", expenseHeadOfAccountRouter);
app.use("/officeExpense", officeExpenseRouter);
app.use("/legalProfessionalExpense", legalProfessionalExpenseRouter);
app.use("/miscellaneousExpense", miscellaneousExpenseRouter);
app.use("/vehicleDisposalExpense", vehicleDisposalExpenseRouter);
app.use("/electricityWaterExpense", electricityAndWaterConnectionExpenseRouter);
app.use("/siteExpense", siteExpenseRouter);

const port = process.env.PORT;
const ip = process.env.IP;

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(port, ip, () => console.log(`Server is running ${ip}:${port}`));
