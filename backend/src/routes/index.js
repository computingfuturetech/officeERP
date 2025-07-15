const { Router } = require("express");

const reportRouter = require("./report/report.route");
const staffUserRouter = require("./staffUser/staffUser.route");
const chartOfAccountsRouter = require("./chartOfAccounts/chartOfAccounts.route");
const voucherRouter = require("./voucher/voucher.route");
const memberPlotRecordRouter = require("./memberPlotRecord/memberPlotRecord.route");

const router = Router();

router.use("/accounts", chartOfAccountsRouter);
router.use("/vouchers", voucherRouter);
router.use("/reports", reportRouter);
router.use("/staff-users", staffUserRouter);
router.use("/member-plot-records", memberPlotRecordRouter);

module.exports = router;
