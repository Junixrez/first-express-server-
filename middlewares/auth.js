const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const jwtVerify = promisify(jwt.verify);

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    throw new CustomError("Missing Auth Header", 401);
  }

  const secretKey = process.env.JWT_SECRET_KEY;
  const decoded = await jwtVerify(token, secretKey);
  req.user = {
    userId: decoded.id,
    email: decoded.email,
    role: decoded.role,
  };
  next();
};
