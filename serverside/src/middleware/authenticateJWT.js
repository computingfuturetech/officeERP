const { expressjwt: expressJwt } = require('express-jwt');
const secret = 'my_super_secret_key'; 

const authenticateJWT = expressJwt({
  secret: secret,
  algorithms: ['HS256'],
  requestProperty: 'auth' 
});

module.exports = authenticateJWT;
