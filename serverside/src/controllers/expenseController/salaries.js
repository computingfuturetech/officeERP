const Salaries = require("../../models/expenseModel/salaries/salaries");
const SalaryType = require("../../models/expenseModel/salaries/salaryType");
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')
const BankList = require("../../models/bankModel/bank");
const CheckBank = require('../../middleware/checkBank');
const GeneralLedger = require('../../middleware/createGeneralLedger');
const BankLedger = require('../../middleware/createBankLedger');
const VoucherNo = require('../../middleware/generateVoucherNo')
const CashBookLedger = require('../../middleware/createCashBookLedger')

module.exports = {
    createSalaries: async (req, res) => {
        const {
            salary_type,
            employee_name,
            amount,
            paid_date,
            head_of_account,
            bank_account,
            cheque_no,
            check,
            challan_no,
            particular
        } = req.body;

        try {
            if (!head_of_account || !salary_type || !amount) {
                return res.status(400).json({ message: "Head of Account and Salary Type are required" });
            }
    
            const salaryType = await SalaryType.findOne({ salaryType: salary_type }).exec();
            if (!salaryType) {
                return res.status(404).json({ message: "Salary type not found" });
            }
    
            if(bank_account){
                const { bank_id } = await CheckBank.checkBank(req, res, bank_account);
            }
    
            const { main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res);
    
            const salaries = new Salaries({
                mainHeadOfAccount: main_head_id,
                subHeadOfAccount: sub_head_id,
                employeeName: employee_name,
                amount: amount,
                paidDate: paid_date,
                salaryType: salaryType._id,
                bank: bank_id?bank_id:null,
                chequeNumber: cheque_no,
                challanNo: challan_no,
                check: check,
                particular: particular
            });

            const update_id = salaries._id;

            const type = "expense";

            if(check == "Cash")
                {
                const cashVoucherNo = await VoucherNo.generateCashVoucherNo(req, res,type)
                await CashBookLedger.createCashBookLedger(req, res, cashVoucherNo, type, head_of_account,particular, amount, paid_date,update_id);
                await GeneralLedger.createGeneralLedger(req, res, cashVoucherNo, type, head_of_account, particular, amount, paid_date, null, challan_no,update_id,null);
                }else if(check == "Bank"){
                const bankVoucherNo = await VoucherNo.generateBankVoucherNo(req, res,bank_account,type)
                await BankLedger.createBankLedger(req, res, bankVoucherNo, type, head_of_account,particular, amount, paid_date,cheque_no, challan_no,update_id,bank_account);
                await GeneralLedger.createGeneralLedger(req, res, bankVoucherNo, type, head_of_account, particular, amount, paid_date, cheque_no, challan_no,update_id,bank_account);
                }

    
            await salaries.save();
    
            res.status(201).json({
                message: "Salary created successfully",
                data: salaries,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    updateSalaries: async (req, res) => {
        const id = req.query.id;
        try {
            if (!id) {
                return res.status(400).json({ message: "ID is required" });
            }
            const existingSalary = await Salaries.findById(id).exec();
            if (!existingSalary) {
                return res.status(404).json({ message: "Salary record not found" });
            }
            const updateData = {};
            if (req.body.date) {
                updateData.date = req.body.date;
            }
            if (req.body.employee_name) {
                updateData.employeeName = req.body.employee_name;
            }
            if (req.body.amount) {
                updateData.amount = req.body.amount;
            }
            if (req.body.adv_tax) {
                updateData.advTax = req.body.adv_tax;
            }
            if (req.body.bill_reference) {
                updateData.billReference = req.body.bill_reference;
            }
            if (req.body.cheque_no) {
                updateData.chequeNumber = req.body.cheque_no;
            }
            if (req.body.particulor) {
                updateData.particulor = req.body.particulor;
            }
            if (req.body.challan_no) {
            updateData.challanNo = req.body.challan_no;
            }
            if (req.body.salary_type) {
                const foundSalaryType = await SalaryType.findOne({ salaryType: req.body.salary_type });
                if (!foundSalaryType) {
                    return res.status(404).json({ message: "Salary type not found" });
                }
                updateData.salaryType = foundSalaryType._id;
            }

            const type = "expense";

            if (req.body.check == "Cash") {
                await CashBookLedger.updateCashLedger(req, res, id, updateData, type);
                await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
            }
            else if (req.body.check == "Bank") {
                await BankLedger.updateBankLedger(req, res, id, updateData, type);
                await GeneralLedger.updateGeneralLedger(req, res, id, updateData, type);
            }
            else {
                console.log("Invalid Check")
            }

            console.log("Update Data:", updateData);
            const updatedSalaries = await Salaries.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            ).exec();
            res.status(200).json({
                message: "Salary record updated successfully",
                data: updatedSalaries,
            });
        } catch (err) {
            console.error("Error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    getSalaries: async (req, res) => {
        const { employee_name } = req.query;
        try {
            let salaries;

            if (employee_name) {
                salaries = await Salaries.find({
                    employeeName: employee_name,
                })
                    .populate("salaryType", "salaryType")
                    .exec();
            } else {
                salaries = await Salaries.find()
                    .populate("salaryType", "salaryType")
                    .exec();
            }

            if (salaries.length === 0) {
                return res.status(404).json({ message: "Salaries not found" });
            }

            res.status(200).json(salaries);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};
