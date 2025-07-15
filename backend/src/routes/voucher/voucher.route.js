const express = require("express");
const router = express.Router();
const voucherController = require("../../controllers/voucher/voucher.controller");
const voucherMiddleware = require("../../middleware/validateVoucher.middleware");
const authorize = require("../../middleware/authorize.middleware");
const authenticate = require("../../middleware/authenticate.middleware");

router.post(
  "/",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  voucherMiddleware.validateVoucherOnCreate,
  voucherController.createVoucher
);
router.patch(
  "/:id",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  voucherMiddleware.validateVoucherOnUpdate,
  voucherController.updateVoucher
);
router.get(
  "/",
  authenticate,
  authorize(["Super Admin", "Admin", "Employee"]),
  voucherController.getVouchers
);
router.delete(
  "/:id",
  authenticate,
  authorize(["Super Admin", "Admin"]),
  voucherController.deleteVoucher
);

module.exports = router;
