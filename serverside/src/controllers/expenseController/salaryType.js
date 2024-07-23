const SalaryType = require("../../models/expenseModel/salaries/salaryType");

module.exports = {
  createSalaryType: async (req, res) => {
    const { salary_type } = req.body;
    console.log(req.body);
    try {
      if (!salary_type) {
        return res.status(400).json({ message: "Salary_type is required" });
      }
      const newSalaryType = new SalaryType({
        salaryType: salary_type,
      });
      await newSalaryType.save();
      res.status(201).json({
        message: "Salary type created successfully",
        data: newSalaryType,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
