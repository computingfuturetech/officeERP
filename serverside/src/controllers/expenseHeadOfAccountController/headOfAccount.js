const SubExpenseHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/subHeadOfAccount");
const MainHeadOfAccount = require("../../models/expenseModel/expenseHeadOfAccount/mainHeadOfAccount");
const expense = require("../expenseController/expense");
const Salaries = require("../../models/expenseModel/salaries/salaries");
const OfficeUtilityExpense = require("../../models/expenseModel/officeUtilExpense/officeutilExpense");
const OfficeExpense = require("../../models/expenseModel/officeExpense/officeExpense");
const legalProfessionalExpense = require("../../models/expenseModel/legalProfessionalExpense/legalProfessionalExpense");
const AuditFeeExpense = require("../../models/expenseModel/auditFeeExpense/auditFeeExpense");
const MiscellaneousExpense = require("../../models/expenseModel/miscellaneousExpense/miscellaneousExpense");
const BankChargesExpense = require("../../models/expenseModel/bankChargesExpense/bankChargesExpense");
const VehicleDisposalExpense = require("../../models/expenseModel/vehicleDisposalExpense/vehicleDisposalExpense");
const ElectricityAndWaterConnectionExpense = require("../../models/expenseModel/electricityAndWaterConnectionExpense/electricityAndWaterConnectionExpense");
const SiteExpense = require("../../models/expenseModel/siteExpense/siteExpense");

module.exports = {
  createMainHeadOfAccount: async (req, res) => {
    const { headOfAccount, expenseType } = req.body;
    try {
      if (!headOfAccount || !expenseType) {
        return res.status(400).json({
          status: "error",
          message: "Head of Account id required",
        });
      }
      const mainHeadOfAccount = new MainHeadOfAccount({
        headOfAccount: headOfAccount,
        expenseType: expenseType,
      });
      await mainHeadOfAccount.save();
      res.status(201).json({
        status: "success",
        message: "Head of Account created successfully",
        data: mainHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateMainHeadOfAccount: async (req, res) => {
    const { headOfAccount } = req.body;
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }
      const mainHeadOfAccount = await MainHeadOfAccount.findById(id).exec();
      if (!mainHeadOfAccount) {
        return res.status(404).json({
          status: "error",
          message: "Main Head Of Account not found",
        });
      }
      const updateData = {};
      if (headOfAccount) {
        updateData.headOfAccount = headOfAccount;
      }
      const updatedMainExpenseHeadOfAccount =
        await MainHeadOfAccount.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Main Head Of Account updated successfully",
        data: updatedMainExpenseHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  createSubHeadOfAccount: async (req, res) => {
    const { headOfAccount, mainHeadOfAccount } = req.body;
    try {
      if (!headOfAccount || !mainHeadOfAccount) {
        return res.status(400).json({
          status: "error",
          message: "All fields are required",
        });
      }

      const mainHeadOfAccountFound = await MainHeadOfAccount.findById(
        mainHeadOfAccount
      ).exec();
      if (!mainHeadOfAccountFound) {
        return res.status(404).json({
          status: "error",
          message: "Main Head of account not found",
        });
      }

      const headOfAccountArray = headOfAccount
        .split(",")
        .map((value) => value.trim());

      const promises = headOfAccountArray.map((headOfAccountValue) => {
        const subHeadOfAccount = new SubExpenseHeadOfAccount({
          headOfAccount: headOfAccountValue,
          mainHeadOfAccount: mainHeadOfAccount,
        });
        return subHeadOfAccount.save();
      });

      const subExpenseHeads = await Promise.all(promises);
      const subExpenseHeadIds = subExpenseHeads.map((head) => head._id);

      const saveMainHeadOfAccount = await MainHeadOfAccount.findByIdAndUpdate(
        mainHeadOfAccount,
        {
          $addToSet: {
            subExpenseHeads: subExpenseHeadIds,
          },
        }
      );

      await Promise.all(promises);
      res.status(200).json({
        status: "success",
        message: "Sub HeadOfAccount created successfully",
        data: saveMainHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  updateSubHeadOfAccount: async (req, res) => {
    const { headOfAccount } = req.body;
    const id = req.query.id;
    try {
      if (!id) {
        return res.status(400).json({
          status: "error",
          message: "ID is required",
        });
      }
      const subHeadOfAccount = await SubExpenseHeadOfAccount.findById(
        id
      ).exec();
      if (!subHeadOfAccount) {
        return res.status(404).json({
          status: "error",
          message: "Sub Head Of Account not found",
        });
      }
      const updateData = {};
      if (headOfAccount) {
        updateData.headOfAccount = headOfAccount;
      }
      const updatedSubExpenseHeadOfAccount =
        await SubExpenseHeadOfAccount.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).exec();

      res.status(200).json({
        status: "success",
        message: "Sub Head Of Account updated successfully",
        data: updatedSubExpenseHeadOfAccount,
      });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },
  listOfHeadOfAccount: async (req, res) => {
    try {
      let { expenseType } = req.query;
      if (expenseType === "officeExpense") {
        expenseType = "Office Expense";
      }
      if (expenseType === "siteExpense") {
        expenseType = "Site Expense";
      }
      const filter = expenseType ? { expenseType } : {};

      const headOfAccount = await MainHeadOfAccount.find(filter).populate(
        "subExpenseHeads"
      );

      if (!headOfAccount.length) {
        return res.status(404).json({
          status: "error",
          message: "No Head of Account found",
          data: [],
        });
      }

      const salarySchemaFields = Salaries.schema.paths;
      const officeUtilSchemaFields = OfficeUtilityExpense.schema.paths;
      const officeExpenseSchemaFields = OfficeExpense.schema.paths;
      const auditFeeSchemaFields = AuditFeeExpense.schema.paths;
      const legalProfessionalExpenseSchemaFields =
        legalProfessionalExpense.schema.paths;
      const miscellaneousExpenseSchemaFields =
        MiscellaneousExpense.schema.paths;
      const bankChargesSchemaFields = BankChargesExpense.schema.paths;

      const vehicleDisposalExpenseSchemaFields =
        VehicleDisposalExpense.schema.paths;
      const electricityWaterExpenseSchemaFields =
        ElectricityAndWaterConnectionExpense.schema.paths;
      const siteExpenseSchemaFields = SiteExpense.schema.paths;

      const salaryFormFields = Object.keys(salarySchemaFields)
        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "salaryId" &&
            field !== "salaryType" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (salarySchemaFields[field].instance === "Number")
            fieldType = "number";
          if (salarySchemaFields[field].instance === "Date") fieldType = "date";
          if (salarySchemaFields[field].instance === "ObjectID")
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required: salarySchemaFields[field].isRequired || false,
          };
        });

      const officeUtilityFormFields = Object.keys(officeUtilSchemaFields)
        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "officeUtilId" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (officeUtilSchemaFields[field].instance === "Number")
            fieldType = "number";
          if (officeUtilSchemaFields[field].instance === "Date")
            fieldType = "date";
          if (officeUtilSchemaFields[field].instance === "ObjectID")
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required: officeUtilSchemaFields[field].isRequired || false,
          };
        });

      const officeExpenseFormFields = Object.keys(officeExpenseSchemaFields)
        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "officeExpenseId" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (officeExpenseSchemaFields[field].instance === "Number")
            fieldType = "number";
          if (officeExpenseSchemaFields[field].instance === "Date")
            fieldType = "date";
          if (officeExpenseSchemaFields[field].instance === "ObjectID")
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required: officeExpenseSchemaFields[field].isRequired || false,
          };
        });

      const legalProfessionalExpenseFormFields = Object.keys(
        legalProfessionalExpenseSchemaFields
      )
        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "legalProfessionalExpenseId" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (legalProfessionalExpenseSchemaFields[field].instance === "Number")
            fieldType = "number";
          if (legalProfessionalExpenseSchemaFields[field].instance === "Date")
            fieldType = "date";
          if (
            legalProfessionalExpenseSchemaFields[field].instance === "ObjectID"
          )
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required:
              legalProfessionalExpenseSchemaFields[field].isRequired || false,
          };
        });

      const auditFeeFormFields = Object.keys(auditFeeSchemaFields)
        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "auditFeeId" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (auditFeeSchemaFields[field].instance === "Number")
            fieldType = "number";
          if (auditFeeSchemaFields[field].instance === "Date")
            fieldType = "date";
          if (auditFeeSchemaFields[field].instance === "ObjectID")
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required: auditFeeSchemaFields[field].isRequired || false,
          };
        });

      const miscellaneousExpenseFormFields = Object.keys(
        miscellaneousExpenseSchemaFields
      )
        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "miscellaneousExpenseId" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (miscellaneousExpenseSchemaFields[field].instance === "Number")
            fieldType = "number";
          if (miscellaneousExpenseSchemaFields[field].instance === "Date")
            fieldType = "date";
          if (miscellaneousExpenseSchemaFields[field].instance === "ObjectID")
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required:
              miscellaneousExpenseSchemaFields[field].isRequired || false,
          };
        });

      const bankChargesFormFields = Object.keys(bankChargesSchemaFields)
        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "bankChargesExpenseId" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "check" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (bankChargesSchemaFields[field].instance === "Number")
            fieldType = "number";

          if (bankChargesSchemaFields[field].instance === "Date")
            fieldType = "date";

          if (bankChargesSchemaFields[field].instance === "ObjectID")
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required: bankChargesSchemaFields[field].isRequired || false,
          };
        });

      const vehicleDisposalExpenseFormFields = Object.keys(
        vehicleDisposalExpenseSchemaFields
      )
        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "vehicleDisposalId" &&
            field !== "check" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (vehicleDisposalExpenseSchemaFields[field].instance === "Number")
            fieldType = "number";
          if (vehicleDisposalExpenseSchemaFields[field].instance === "Date")
            fieldType = "date";
          if (vehicleDisposalExpenseSchemaFields[field].instance === "ObjectID")
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required:
              vehicleDisposalExpenseSchemaFields[field].isRequired || false,
          };
        });

      const electricityWaterExpenseFormFields = Object.keys(
        electricityWaterExpenseSchemaFields
      )

        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "electricityWaterExpenseId" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (electricityWaterExpenseSchemaFields[field].instance === "Number")
            fieldType = "number";
          if (electricityWaterExpenseSchemaFields[field].instance === "Date")
            fieldType = "date";
          if (
            electricityWaterExpenseSchemaFields[field].instance === "ObjectID"
          )
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required:
              electricityWaterExpenseSchemaFields[field].isRequired || false,
          };
        });

      const siteExpenseFormFields = Object.keys(siteExpenseSchemaFields)
        .filter(
          (field) =>
            field !== "createdAt" &&
            field !== "updatedAt" &&
            field !== "siteExpenseId" &&
            field !== "mainHeadOfAccount" &&
            field !== "subHeadOfAccount" &&
            field !== "_id" &&
            field !== "__v"
        )
        .map((field) => {
          let fieldType = "text";

          if (siteExpenseSchemaFields[field].instance === "Number")
            fieldType = "number";
          if (siteExpenseSchemaFields[field].instance === "Date")
            fieldType = "date";
          if (siteExpenseSchemaFields[field].instance === "ObjectID")
            fieldType = "select";

          return {
            name: field,
            type: fieldType,
            label: field.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to readable label
            required: siteExpenseSchemaFields[field].isRequired || false,
          };
        });

      return res.status(200).json({
        status: "success",
        message: "List of Head of Account",
        data: headOfAccount,
        fields: {
          "Salaries Office Employees": salaryFormFields,
          "Utility Office": officeUtilityFormFields,
          "Office Expense": officeExpenseFormFields,
          "Printing And Stationary": officeExpenseFormFields,
          Newspaper: officeExpenseFormFields,
          Advertisement: officeExpenseFormFields,
          Entertainment: officeExpenseFormFields,
          "Office Repair/Maintenance": officeExpenseFormFields,
          "Rent Rate/Taxes": officeExpenseFormFields,
          "Legal/Profit": legalProfessionalExpenseFormFields,
          Audit: auditFeeFormFields,
          "Miscellaneous Office": miscellaneousExpenseFormFields,
          "Bank Charges": bankChargesFormFields,

          "Salaries Site Employees": salaryFormFields,
          "Lesco Site": officeUtilityFormFields,
          "Disposal/Vehicle Expense": vehicleDisposalExpenseFormFields,
          "Electricity/Water Connection": electricityWaterExpenseFormFields,
          Miscellaneous: miscellaneousExpenseFormFields,
          "Purchase of Land": siteExpenseFormFields,
          "Development Expenditure": siteExpenseFormFields,
          "Repair/Maintenance": siteExpenseFormFields,
        },
        endPoints: {
          "Salaries Office Employees": "salary/",
          "Utility Office": "officeUtilExpense/",
          "Office Expense": "officeExpense/",
          "Printing And Stationary": "officeExpense/",
          Newspaper: "officeExpense/",
          Advertisement: "officeExpense/",
          Entertainment: "officeExpense/",
          "Office Repair/Maintenance": "officeExpense/",
          "Rent Rate/Taxes": "officeExpense/",
          "Legal/Profit": "legalProfessionalExpense/",
          Audit: "auditExpense/",
          "Miscellaneous Office": "miscellaneousExpense/",
          "Bank Charges": "bankChargesExpense/",

          "Salaries Site Employees": "salary/",
          "Lesco Site": "officeUtilExpense/",
          "Disposal/Vehicle Expense": "vehicleDisposalExpense/",
          "Electricity/Water Connection": "electricityWaterExpense/",
          Miscellaneous: "miscellaneousExpense/",
          "Purchase of Land": "siteExpense/",
          "Development Expenditure": "siteExpense/",
          "Repair/Maintenance": "siteExpense/",
        },
      });
    } catch (err) {
      console.error("Error fetching Head of Account:", err);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: err.message,
      });
    }
  },
};
