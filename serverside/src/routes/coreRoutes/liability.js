const express= require('express');
const router = express.Router();
router.use(express.json())
router.use(express.urlencoded({extended:true}))
const authenticateJWT = require('../../middleware/authenticateJWT');
const checkRole = require('../../middleware/checkRole');

const liability = require('../../controllers/incomeController/liability')

router.post("/createLiability",authenticateJWT,checkRole(['admin','employee']),liability.createLiability);

module.exports = router