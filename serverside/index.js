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

dotenv.config();

const coreRouter = require("./src/routes/coreRoutes/coreApi");
const incomeRouter = require("./src/routes/coreRoutes/incomeApi");
const expenseRouter = require("./src/routes/coreRoutes/expenseApi");
// const memberRouter = require("./src/routes/coreRoutes/memberApi");
const fixedAmountRouter = require("./src/routes/coreRoutes/fixedAmountApi");
const liabilityRouter = require("./src/routes/coreRoutes/liability");
const ledgerRouter = require("./src/routes/coreRoutes/ledgerApi");

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

const port = process.env.PORT;
const ip = process.env.IP;

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(port, ip, () => console.log(`Server is running ${ip}:${port}`));
