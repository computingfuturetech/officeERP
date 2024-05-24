const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))

const coreController = require('../../controllers/createUserController/create')
const loginController = require('../../controllers/createUserController/login')
const memberListCOntroller = require('../../controllers/memberController/memberList')

router.get("/hello",coreController.get);
router.post("/create",coreController.create);
router.post("/login",loginController.login);
router.post("/memberlist",memberListCOntroller.memberList)

module.exports = router;