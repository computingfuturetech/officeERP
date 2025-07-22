const bcrypt = require("bcryptjs");

function generateHashedPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, 10);
}

function validatePassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

module.exports = {
  generateHashedPassword,
  validatePassword,
};
