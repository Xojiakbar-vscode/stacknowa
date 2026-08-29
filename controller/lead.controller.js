const { Lead, Course, Event } = require("../models");
const { validateLead } = require("../validation/leadValidation");
const { verifyCaptchaToken } = require("./captcha.controller");
const { sendLeadNotification } = require("../utils/telegramNotifier");

exports.createLead = async (req, res) => {
  const { captchaToken, captchaAnswer } = req.body;

  // Validate Captcha if provided or enforce it
  if (captchaToken || captchaAnswer !== undefined) {
    const isValid = verifyCaptchaToken(captchaToken, captchaAnswer);
    if (!isValid) {
      return res.status(400).json({ message: "Captcha javobi noto'g'ri. Iltimos qaytadan urinib ko'ring!" });
    }
  }

  const { error } = validateLead(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const lead = await Lead.create(req.body);

    // Send Telegram notification to specified chat IDs (1828931356, 1743441642, 6519831069)
    sendLeadNotification(lead).catch((err) => console.error("Lead telegram notification error:", err));

    // If linked to event, decrement seats_left if available
    if (req.body.eventId) {
      const event = await Event.findByPk(req.body.eventId);
      if (event && event.seatsLeft > 0) {
        await event.decrement("seatsLeft");
      }
    }

    return res.status(201).json({
      message: "Arizangiz qabul qilindi 🎉 Tez orada siz bilan bog'lanamiz.",
      lead,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { status, source, courseId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (source) where.source = source;
    if (courseId) where.courseId = courseId;

    const leads = await Lead.findAll({
      where,
      include: [
        { model: Course, as: "course", attributes: ["id", "title"] },
        { model: Event, as: "event", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(leads);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["New", "Contacted", "Interested", "Registered", "Rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Noto'g'ri status kiritildi" });
    }

    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ message: "Ariza topilmadi" });

    if (status) lead.status = status;
    if (notes !== undefined) lead.notes = notes;

    await lead.save();
    return res.status(200).json({ message: "Ariza statusi yangilandi", lead });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByPk(id);
    if (!lead) return res.status(404).json({ message: "Ariza topilmadi" });

    await lead.destroy();
    return res.status(200).json({ message: "Ariza o'chirildi", id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
