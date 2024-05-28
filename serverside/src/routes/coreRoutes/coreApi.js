const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))

const coreController = require('../../controllers/createUserController/create')
const loginController = require('../../controllers/createUserController/login')
const memberController = require('../../controllers/memberController/memberFilter')
const newMemberController = require('../../controllers/memberController/newMember')
const getMemberListController = require('../../controllers/memberController/getMemberList')
const getDelistedMemberListController = require('../../controllers/memberController/getDelistedMemberList')
const transferMembershipController = require('../../controllers/memberController/transferMembership')
const updateMemberController = require('../../controllers/memberController/updateMember')

router.get("/hello",coreController.get);
router.post("/create",coreController.create);
router.post("/login",loginController.login);
router.post("/getMemberByFilter", memberController.getMemberByFilter);
router.post("/createMember", newMemberController.createMember);
router.get("/getMemberList", getMemberListController.getMemberList);
router.get("/getDelistedMemberList", getDelistedMemberListController.getDelistedMemberList);
router.post("/transferMembership", transferMembershipController.transferMembership);
router.post("/updateMember", updateMemberController.updateMember);


module.exports = router;