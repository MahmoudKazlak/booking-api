import Joi from "joi";

export const signup = {
  body: Joi.object()
    .required()
    .keys({
      userName: Joi.string().required().messages({
        "any.required": "please enter username",
      }),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp(/^[A-Z][a-z]{2,6}$/))
        .required(),
      cPassword: Joi.string().valid(Joi.ref("password")).required(),
    }),
};

export const signin = {
  body: Joi.object()
    .required()
    .keys({
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp(/^[A-Z][a-z]{2,6}$/))
        .required(),
    }),
};
