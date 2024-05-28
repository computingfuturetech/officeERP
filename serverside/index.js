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


const port = 3000;
const ip = "http://127.0.0.1";
app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(port, () => console.log(`Server is running ${ip}:${port}`));
