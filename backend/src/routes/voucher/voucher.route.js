const express = require("express");
const router = express.Router();
const voucherController = require("../../controllers/voucher/voucher.controller");
const voucherMiddleware = require("../../middleware/validateVoucher.middleware");

router.post(
  "/",
  voucherMiddleware.validateVoucherOnCreate,
  voucherController.createVoucher
);
router.patch(
  "/:id",
  voucherMiddleware.validateVoucherOnUpdate,
  voucherController.updateVoucher
);
router.get("/", voucherController.getVouchers);
router.delete("/:id", voucherController.deleteVoucher);

module.exports = router;
