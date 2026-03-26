const Joi = require("joi");

const validateHomeBanner = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image_url: Joi.string().uri().required(),
    button_text: Joi.string().optional(),
    button_link: Joi.string().uri().optional(),
    order: Joi.number().integer().default(0),
    is_active: Joi.boolean().default(true),
  });
  return schema.validate(data);
};

module.exports = { validateHomeBanner };