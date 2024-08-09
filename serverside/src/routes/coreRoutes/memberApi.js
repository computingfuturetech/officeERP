const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))
const authenticateJWT = require('../../middleware/authenticateJWT');
const checkRole = require('../../middleware/checkRole');

const newMemberController = require('../../controllers/memberController/newMember')
const getMemberListController = require('../../controllers/memberController/getMemberList')
const getDelistedMemberListController = require('../../controllers/memberController/getDelistedMemberList')
const transferMembershipController = require('../../controllers/memberController/transferMembership')
const updateMemberController = require('../../controllers/memberController/updateMember')
const memberDeposit = require('../../controllers/memberController/memberDeposit')

router.post("/createMember", authenticateJWT,checkRole(['admin','employee']),newMemberController.createMember);
router.get("/getMemberList/", authenticateJWT,checkRole(['admin','employee']),getMemberListController.getMemberList);
router.get("/getDelistedMemberList", authenticateJWT,checkRole(['admin','employee']),getDelistedMemberListController.getDelistedMemberList);
router.post("/transferMembership", authenticateJWT,checkRole(['admin','employee']),transferMembershipController.transferMembership);
router.post("/updateMember", authenticateJWT,checkRole(['admin','employee']),updateMemberController.updateMember);
router.post('/memberDeposit', authenticateJWT,checkRole(['admin','employee']), memberDeposit.memberDeposit);

module.exports = router