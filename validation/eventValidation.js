const Joi = require("joi");

const validateEvent = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255).required(),
    slug: Joi.string().min(2).max(255).optional(),
    coverImage: Joi.string().uri().allow("", null).optional(),
    eventDate: Joi.string().required(),
    eventTime: Joi.string().required(),
    location: Joi.string().required(),
    shortDescription: Joi.string().required(),
    fullDescription: Joi.string().allow("", null).optional(),
    eventType: Joi.string().valid("Workshop", "Masterclass", "Open Day", "Seminar", "Hackathon", "Meetup").optional(),
    price: Joi.number().optional(),
    isFree: Joi.boolean().optional(),
    seatsTotal: Joi.number().optional(),
    seatsLeft: Joi.number().optional(),
    status: Joi.string().valid("upcoming", "active", "finished", "cancelled").optional(),
    telegramBotUrl: Joi.string().allow("", null).optional(),
  });

  return schema.validate(data);
};

module.exports = {
  validateEvent,
};
