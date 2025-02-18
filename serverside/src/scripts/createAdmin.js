const ScriptFlag = require("../models/scriptFlag/scriptFlag");
const Admin = require("../models/coreModels/Admin");
const bcrypt = require("bcryptjs");
const { generate: uniqueId } = require("shortid");

module.exports = async function createAdmin() {
  try {
    const createAdminScriptFlag = await ScriptFlag.findOne({
      name: "create-admin-script",
    });
    if (!createAdminScriptFlag || !createAdminScriptFlag.flag) {
      const email = process.env.FIRST_ADMIN_EMAIL;
      const password = process.env.FIRST_ADMIN_PASSWORD;

      if (email && password) {
        if (password.length < 8) {
          console.error(
            `FAILURE: create-admin-script: password must be atleast 8 characters long`
          );
        } else {
          const existingUser = await Admin.findOne({
            email,
          });

          if (!existingUser) {
            const salt = uniqueId();
            const passwordHash = bcrypt.hashSync(salt + password);

            await new Admin({
              email,
              role: "admin",
              password: passwordHash,
              salt: salt,
            }).save();

            await ScriptFlag.updateOne(
              { name: "create-admin-script" },
              { flag: true },
              { upsert: true },
            );

            console.log(
              "SUCCESS: create-admin-script: user created successfully"
            );
          } else {
            console.error(
              `FAILURE: create-admin-script: user with email ${email} already exists`
            );
          }
        }
      } else {
        console.error(
          `FAILURE: create-admin-script: email or password not provided`
        );
      }
    }
  } catch (error) {
    console.error(`FAILURE: create-admin-script: ${error}`);
  }
};
