const Joi = require("joi");

const validateLead = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(100).required(),
    phone: Joi.string().min(7).max(20).required(),
    courseId: Joi.number().optional().allow(null),
    eventId: Joi.number().optional().allow(null),
    source: Joi.string().optional().allow("", null),
    status: Joi.string().valid("New", "Contacted", "Interested", "Registered", "Rejected").optional(),
    notes: Joi.string().allow("", null).optional(),
    captchaToken: Joi.string().optional().allow("", null),
    captchaAnswer: Joi.alternatives().try(Joi.string(), Joi.number()).optional().allow("", null),
  });

  return schema.validate(data);
};

module.exports = {
  validateLead,
};
