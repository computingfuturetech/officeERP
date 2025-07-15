const { expressjwt: expressJwt } = require("express-jwt");
const secret = process.env.JWT_ACCESS_SECRET;

const authenticate = expressJwt({
  secret: secret,
  algorithms: ["HS256"],
  requestProperty: "auth",
});

module.exports = authenticate;
