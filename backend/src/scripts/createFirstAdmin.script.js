const ScriptFlag = require("../models/scriptFlag/scriptFlag");
const StaffUser = require("../models/staffUser/staffUser.model");
const { generateHashedPassword } = require("../utils/pass.util");

module.exports = async function createFirstAdmin() {
  try {
    const createFirstAdminScriptFlag = await ScriptFlag.findOne({
      name: "create-first-admin-script",
    });
    if (!createFirstAdminScriptFlag?.flag) {
      const email = process.env.FIRST_ADMIN_EMAIL;
      const password = process.env.FIRST_ADMIN_PASS;
      const firstName = process.env.FIRST_ADMIN_FIRST_NAME || "Admin";

      if (email && password) {
        if (password.length < 8) {
          console.error(
            `FAILURE: create-first-admin-script: password must be at least 8 characters long`
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
              role: "Admin",
            }).save();

            await ScriptFlag.updateOne(
              { name: "create-first-admin-script" },
              { flag: true },
              { upsert: true },
            );

            console.log(
              "SUCCESS: create-first-admin-script: user created successfully"
            );
          } else {
            console.error(
              `FAILURE: create-first-admin-script: user with email ${email} already exists`
            );
          }
        }
      } else {
        console.error(
          `FAILURE: create-first-admin-script: email or password not provided`
        );
      }
    }
  } catch (error) {
    console.error(`FAILURE: create-first-admin-script: ${error}`);
  }
};
