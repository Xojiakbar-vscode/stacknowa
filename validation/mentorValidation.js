const Joi = require("joi");

const validateMentor = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    role: Joi.string().required(),
    experience: Joi.string().required(),
    bio: Joi.string().allow("", null).optional(),
    photoUrl: Joi.string().uri().allow("", null).optional(),
    socialLinks: Joi.object().optional().allow(null),
    isFeatured: Joi.boolean().optional(),
  });

  return schema.validate(data);
};

module.exports = {
  validateMentor,
};
