const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const authenticateJWT = require("../../middleware/authenticateJWT");
const checkRole = require("../../middleware/checkRole");

const memberDeposit = require("../../controllers/memberController/memberDeposit");

const memberController = require("../../controllers/memberController/member");

const memberBulkUpload = require("../../controllers/memberController/memberBulkUpload");

router.post(
  "/create",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  memberController.createMember
);

router.post(
  "/update",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  memberController.updateMember
);

router.get(
  "/getDelistedMemberList",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  memberController.getDelistedMemberList
);

router.post(
  "/transferMembership",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  memberController.transferMembership
);

router.get(
  "/getMemberList",
  authenticateJWT,
  checkRole(["admin", "employee"]),
  memberController.getMemberList
);

// router.post(
//   "/memberDeposit",
//   authenticateJWT,
//   checkRole(["admin", "employee"]),
//   memberDeposit.memberDeposit
// );

// router.post(
//   "/deposit",
//   authenticateJWT,
//   checkRole(["admin", "employee"]),
//   memberController.memberDeposit
// );

module.exports = router;
