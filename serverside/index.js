const express = require("express");
require("./src/config/config");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const app = express();
const MemberList = require("./src/models/memberModels/memberList");
const DelistedMemberList = require("./src/models/memberModels/delistedMember");
const MemberDeposit = require("./src/models/memberModels/memberDeposit");
const BankLedger = require("./src/models/ledgerModels/bankLedger");
const GeneralLedger = require("./src/models/ledgerModels/generalLedger");
const CashBook = require("./src/models/ledgerModels/cashBookLedger");
const HeadOfAccount = require("./src/models/headOfAccountModel/headOfAccountModel");
const ForgetPassword = require("./src/models/coreModels/forgetPassword")
const BankList = require("./src/models/ledgerModels/bankList")
const OperatingFixedassets = require("./src/models/operatingFixedAssetsModels/operatingFixedAssets")
const PayableVouchers = require("./src/models/payableVoucherModel/payableVouchers")
const NonCurrentliablities = require("./src/models/liabilitiesModel/nonCurrentLiabilities")
const Currentliablities = require("./src/models/liabilitiesModel/currentLiabilities")
const Counter = require('./src/models/counterModel/voucherCounter'); 
const SingleTierChallan = require('./src/models/challanModels/singleTierChallan'); 
const ThreeTierChallan = require('./src/models/challanModels/threeTierChallan'); 
 

dotenv.config();

const coreRouter = require("./src/routes/coreRoutes/coreApi");

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


const port = 3001;
// const ip = '192.168.0.189';
const ip = '192.168.100.13';
app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(port, ip, () => console.log(`Server is running ${ip}:${port}`));
