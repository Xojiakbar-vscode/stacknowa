const Joi = require("joi");

exports.validateAdminRegister = (data) => {
  const schema = Joi.object({
    fullname: Joi.string().min(3).required(),
    username: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

exports.validateAdminLogin = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};