const Joi = require("joi");

const validateService = (data) => {
  const schema = Joi.object({
    title: Joi.object().required(), // .JSON() -> .object()
    description: Joi.object().required(),
    icon_code: Joi.string().required(),
    order: Joi.number().integer().default(0),
    is_active: Joi.boolean().default(true),
  });
  return schema.validate(data);
};

module.exports = { validateService };