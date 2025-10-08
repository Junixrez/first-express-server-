const CustomError = require("../utils/schemas/customError");

module.exports = (err, req, res, next) => {
  console.error(`❌❌ Error: ${err.message}`, err.stack);

  // mongoose cast error
  if (err.name === "CastError") {
    const tempArr = err.message.split(" ");
    const model = tempArr[14];
    const field = tempArr[11];
    return res.status(400).json({
      status: "error",
      message: `Invalid ${field} for ${model}`,
    });
  }
  // mongoose validation error
  if (err.name == "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      status: "error",
      message: `Duplicate value for field: ${field}`,
    });
  }

  // custom error
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: err.message,
  });
};
