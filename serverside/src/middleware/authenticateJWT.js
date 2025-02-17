const { expressjwt: expressJwt } = require('express-jwt');
const secret = process.env.JWT_SECRET; 

const authenticateJWT = expressJwt({
  secret: secret,
  algorithms: ['HS256'],
  requestProperty: 'auth' 
});

module.exports = authenticateJWT;