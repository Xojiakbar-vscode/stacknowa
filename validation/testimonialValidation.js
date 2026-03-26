const Joi = require("joi");

const validateTestimonial = (data) => {
  const schema = Joi.object({
    customer_name: Joi.object().required(), // .JSON() -> .object()
    company_name: Joi.object().optional().allow(null),
    description: Joi.object().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    image_url: Joi.string().uri().optional().allow('', null),
    order: Joi.number().integer().default(0),
    is_active: Joi.boolean().default(true),
  });
  return schema.validate(data);
};

module.exports = { validateTestimonial };