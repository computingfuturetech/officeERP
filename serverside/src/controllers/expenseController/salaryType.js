const SalaryType = require("../../models/expenseModel/salaries/salaryType");

module.exports = {
  createSalaryType: async (req, res) => {
    const { salaryType } = req.body;
    try {
      if (!salaryType) {
        return res.status(400).json({
          status: "error",
          message: "Salary Type is required",
        });
      }
      const newSalaryType = new SalaryType({
        salaryType: salaryType,
      });
      await newSalaryType.save();
      res.status(201).json({
        status: "success",
        message: "Salary type created successfully",
        data: newSalaryType,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
