const {appError} = require("../utils/appError");
const getTokenFromHeader = require("../utils/getTokenFromHeader");
const verifyToken = require("../utils/verifyToken");


const isLogin = (req, res, next) =>{
  const token = getTokenFromHeader(req);
  const decodedUser = verifyToken(token);

  req.userAuth = decodedUser.id;

  if (!decodedUser) {
    return next(appError("Invalid Token, please login again", 500));
  } else {
    next();
  }
};

module.exports = isLogin;
