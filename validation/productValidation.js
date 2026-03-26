const Joi = require("joi");

const validateProduct = (data) => {
  const schema = Joi.object({
    title: Joi.object().required(), // .JSON() -> .object() ga almashtirildi
    description: Joi.object().required(),
    image_url: Joi.string().uri().required(),
    project_link: Joi.string().uri().optional().allow('', null),
    github_link: Joi.string().uri().optional().allow('', null),
    technologies: Joi.array().items(Joi.string()).optional(),
    order: Joi.number().integer().default(0),
    is_active: Joi.boolean().default(true),
  });
  return schema.validate(data);
};

module.exports = { validateProduct };