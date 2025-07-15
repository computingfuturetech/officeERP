const ScriptFlag = require("../models/scriptFlag/scriptFlag");
const StaffUser = require("../models/staffUser/staffUser.model");
const { generateHashedPassword } = require("../utils/pass.util");

module.exports = async function createSuperAdmin() {
  try {
    const createSuperAdminScriptFlag = await ScriptFlag.findOne({
      name: "create-super-admin-script",
    });
    if (!createSuperAdminScriptFlag?.flag) {
      const email = process.env.SUPER_ADMIN_EMAIL;
      const password = process.env.SUPER_ADMIN_PASS;
      const firstName = process.env.SUPER_ADMIN_FIRST_NAME || "Admin";

      if (email && password) {
        if (password.length < 8) {
          console.error(
            `FAILURE: create-super-admin-script: password must be at least 8 characters long`
          );
        } else {
          const existingUser = await StaffUser.findOne({
            email,
          });

          if (!existingUser) {
            const hashedPassword = generateHashedPassword(password);

            await new StaffUser({
              firstName,
              email,
              hashedPassword,
              role: "Super Admin",
            }).save();

            await ScriptFlag.updateOne(
              { name: "create-super-admin-script" },
              { flag: true },
              { upsert: true },
            );

            console.log(
              "SUCCESS: create-super-admin-script: user created successfully"
            );
          } else {
            console.error(
              `FAILURE: create-super-admin-script: user with email ${email} already exists`
            );
          }
        }
      } else {
        console.error(
          `FAILURE: create-super-admin-script: email or password not provided`
        );
      }
    }
  } catch (error) {
    console.error(`FAILURE: create-super-admin-script: ${error}`);
  }
};
