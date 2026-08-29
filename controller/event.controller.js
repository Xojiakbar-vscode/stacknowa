const { Event } = require("../models");
const { validateEvent } = require("../validation/eventValidation");
const { Op } = require("sequelize");

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

exports.createEvent = async (req, res) => {
  const { error } = validateEvent(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const slug = req.body.slug || `${slugify(req.body.title)}-${Date.now()}`;
    const event = await Event.create({
      ...req.body,
      slug,
    });
    return res.status(201).json({ message: "Event yaratildi", event });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { status, eventType } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (eventType) {
      where.eventType = eventType;
    }

    const events = await Event.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(events);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getEventBySlugOrId = async (req, res) => {
  try {
    const { identifier } = req.params;
    let event;

    if (!isNaN(identifier)) {
      event = await Event.findByPk(identifier);
    } else {
      event = await Event.findOne({ where: { slug: identifier } });
    }

    if (!event) return res.status(404).json({ message: "Event topilmadi" });
    return res.status(200).json(event);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  const { error } = validateEvent(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: "Event topilmadi" });

    await event.update(req.body);
    return res.status(200).json({ message: "Event yangilandi", event });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: "Event topilmadi" });

    await event.destroy();
    return res.status(200).json({ message: "Event o'chirildi", id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
