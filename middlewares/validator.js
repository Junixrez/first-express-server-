const CustomError = require("../utils/customError");
module.exports = (schema) => {
  return async (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: true });

    if (error) {
      throw new CustomError(error.message, 400);
    }
    next();
  };
};
