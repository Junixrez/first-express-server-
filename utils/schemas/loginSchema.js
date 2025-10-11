const Joi = require("joi");

const logInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(20).required().messages({
    "any.required": "⚠️⚠️ Password is required",
  }),
});

module.exports = logInSchema;
