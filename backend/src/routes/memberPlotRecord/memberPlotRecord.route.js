const { Router } = require("express");
const path = require("path");
const multer = require("multer");
const authenticate = require("../../middleware/authenticate.middleware");
const authorize = require("../../middleware/authorize.middleware");
const memberPlotRecordController = require("../../controllers/memberPlotRecord/memberPlotRecord.controller.js");

const upload = multer({
  dest: path.join(__dirname, "../../../public/uploads/member-plot-records-csv"),
});
const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["Super Admin", "Admin", "Employee"]),
  memberPlotRecordController.getMemberPlotRecords
);

router.post(
  "/",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  memberPlotRecordController.createMemberPlotRecord
);

router.patch(
  "/:id",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  memberPlotRecordController.updateMemberPlotRecord
);

router.delete(
  "/:id",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  memberPlotRecordController.deleteMemberPlotRecord
);

router.post(
  "/transfer",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  memberPlotRecordController.transferPlot
);

router.post(
  "/bulk/validate",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  upload.single("file"),
  memberPlotRecordController.bulkValidateMemberPlotRecords
);

router.post(
  "/bulk/upload",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  upload.single("file"),
  memberPlotRecordController.bulkUploadMemberPlotRecords
);

module.exports = router;
