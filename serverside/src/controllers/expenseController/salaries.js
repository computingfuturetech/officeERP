const Salaries = require("../../models/expenseModel/salaries/salaries");
const SalaryType = require("../../models/expenseModel/salaries/salaryType");

module.exports = {
    createSalaries: async (req, res) => {
        const {
            salary_type,
            employee_name,
            amount,
            date,
        } = req.body;
        console.log(req.body);
        try {
            if (!date || !employee_name || !salary_type || !amount) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const foundSalaryType = await SalaryType.findOne({
                salaryType: salary_type,
            });

            if (!foundSalaryType) {
                return res.status(404).json({ message: "Salary type not found" });
            }

            const newSalary = new Salaries({
                date: date,
                salaryType: foundSalaryType._id,
                employeeName: employee_name,
                amount: amount,
            });

            await newSalary.save();

            res.status(201).json({
                message: "Salaries created successfully",
                data: newSalary,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
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
                    .populate("salaryType", "salaryType") // Correct field name
                    .exec();
            } else {
                salaries = await Salaries.find()
                    .populate("salaryType", "salaryType") // Correct field name
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
