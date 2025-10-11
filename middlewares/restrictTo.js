const CustomError = require("../utils/customError");

module.exports = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new CustomError(
        "You are not authorized to access this resource",
        403
      );
    }
    next();
  };
};
