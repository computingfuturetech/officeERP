const Salaries = require("../../models/expenseModel/salaries/salaries");
const SalaryType = require("../../models/expenseModel/salaries/salaryType");
const CheckMainAndSubHeadOfAccount = require('../../middleware/checkMainAndSubHeadOfAccount')
const BankList = require("../../models/bankModel/bank");

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
        } = req.body;
      
        try {
          if (!head_of_account || !salary_type || !amount) {
            return res.status(400).json({ message: "Head of Account and Salary Type are required" });
          }
      
          const salaryType = await SalaryType.findOne({ salaryType: salary_type }).exec();
          if (!salaryType) {
            return res.status(404).json({ message: "Salary type not found" });
          }

          if(req.body.bank){
            const bank = await BankList.findOne({
              accountNo: bank_account
            });
            if (!bank) {
              return res
                .status(400)
                .json({ message: "Invalid Bank Account Number" });
            }
          }

          const bank = await BankList.findOne({
            accountNo: bank_account
          });
          if (!bank) {
            return res
              .status(400)
              .json({ message: "Invalid Bank Account Number" });
          }
      
          const { main_head_id, sub_head_id } = await CheckMainAndSubHeadOfAccount.createHeadOfAccount(req, res);
      
          const salaries = new Salaries({
            mainHeadOfAccount: main_head_id,
            subHeadOfAccount: sub_head_id,
            employeeName: employee_name,
            amount: amount,
            paidDate: paid_date,
            salaryType: salaryType._id,
            bank: bank._id,
            chequeNumber: cheque_no,
          });
      
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
            if (req.body.salary_type) {
                const foundSalaryType = await SalaryType.findOne({ salaryType: req.body.salary_type });
                if (!foundSalaryType) {
                    return res.status(404).json({ message: "Salary type not found" });
                }
                updateData.salaryType = foundSalaryType._id;
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
