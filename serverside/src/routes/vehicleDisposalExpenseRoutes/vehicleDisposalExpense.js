const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const vehicleDisposal = require("../../controllers/expenseController/vehicleDisposalExpense");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  vehicleDisposal.createVehicleDisposalExpense
);
router.get(
  "/get",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  vehicleDisposal.getVehicleDisposalExpense
);
router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  vehicleDisposal.updateVehicleDisposalExpense
);

module.exports = router;
