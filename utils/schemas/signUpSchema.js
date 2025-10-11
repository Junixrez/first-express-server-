const Joi = require("joi");

const signUpSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .max(20)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "⚠️⚠️ Password is required",
    }),
  passwordConfirm: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "⚠️⚠️ Password and password confirm must be the same",
  }),
});

module.exports = signUpSchema;
