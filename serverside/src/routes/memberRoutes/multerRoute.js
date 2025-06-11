// routes/memberRoutes.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  validateCsvFile,
  uploadValidMembers,
} = require("../../controllers/memberController/memberBulkUpload");

const upload = multer({ dest: "uploads/" });

router.post("/validate-members", upload.single("file"), validateCsvFile);
router.post("/upload-members", upload.single("file"), uploadValidMembers);

module.exports = router;
