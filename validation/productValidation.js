const Joi = require("joi");

const validateProduct = (data) => {
  const schema = Joi.object({
    title: Joi.JSON().required(),
    description: Joi.JSON().required(),
    image_url: Joi.string().uri().required(),
    project_link: Joi.JSON().uri().optional(),
    github_link: Joi.string().uri().optional(),
    technologies: Joi.array().items(Joi.string()).optional(),
    order: Joi.number().integer().default(0),
    is_active: Joi.boolean().default(true),
  });
  return schema.validate(data);
};

module.exports = { validateProduct };