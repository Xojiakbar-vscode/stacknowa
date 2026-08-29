const Joi = require("joi");

const validateCourse = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255).required(),
    slug: Joi.string().min(2).max(255).optional(),
    coverImage: Joi.string().uri().allow("", null).optional(),
    shortDescription: Joi.string().required(),
    fullDescription: Joi.string().allow("", null).optional(),
    category: Joi.string().required(),
    duration: Joi.string().required(),
    level: Joi.string().optional(),
    format: Joi.string().optional(),
    price: Joi.number().optional().allow(null),
    priceText: Joi.string().allow("", null).optional(),
    schedule: Joi.string().allow("", null).optional(),
    startDate: Joi.string().allow("", null).optional(),
    program: Joi.array().optional().allow(null),
    features: Joi.array().optional().allow(null),
    isFeatured: Joi.boolean().optional(),
    status: Joi.string().valid("published", "draft").optional(),
    mentorId: Joi.number().optional().allow(null, ""),
    orderIndex: Joi.number().optional().allow(null),
  });

  return schema.unknown(true).validate(data);
};

module.exports = {
  validateCourse,
};
