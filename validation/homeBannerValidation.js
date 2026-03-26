const Joi = require("joi");

const validateHomeBanner = (data) => {
  const schema = Joi.object({
    title: Joi.JSON().required(),
    description: Joi.JSON().required(),
    image_url: Joi.JSON().uri().required(),
    button_text: Joi.JSON().optional(),
    button_link: Joi.JSON().uri().optional(),
    order: Joi.number().integer().default(0),
    is_active: Joi.boolean().default(true),
  });
  return schema.validate(data);
};

module.exports = { validateHomeBanner };