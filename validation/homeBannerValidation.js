const Joi = require("joi");

const validateHomeBanner = (data) => {
  const schema = Joi.object({
    // JSON obyektlar uchun .object() ishlatiladi
    title: Joi.object().required(), 
    description: Joi.object().required(),
    // Rasm linki (string) bo'lishi kerak
    image_url: Joi.string().uri().required(), 
    button_text: Joi.string().optional().allow('', null),
    button_link: Joi.string().uri().optional().allow('', null),
    order: Joi.number().integer().default(0),
    is_active: Joi.boolean().default(true),
  });
  return schema.validate(data);
};

module.exports = { validateHomeBanner };