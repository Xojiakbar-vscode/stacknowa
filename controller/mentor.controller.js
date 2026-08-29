const { Mentor, Course } = require("../models");
const { validateMentor } = require("../validation/mentorValidation");

exports.createMentor = async (req, res) => {
  const { error } = validateMentor(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const mentor = await Mentor.create(req.body);
    return res.status(201).json({ message: "Mentor yaratildi", mentor });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.findAll({
      include: [{ model: Course, as: "courses", attributes: ["id", "title", "slug"] }],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(mentors);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findByPk(req.params.id, {
      include: [{ model: Course, as: "courses" }],
    });
    if (!mentor) return res.status(404).json({ message: "Mentor topilmadi" });
    return res.status(200).json(mentor);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateMentor = async (req, res) => {
  const { error } = validateMentor(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const mentor = await Mentor.findByPk(req.params.id);
    if (!mentor) return res.status(404).json({ message: "Mentor topilmadi" });

    await mentor.update(req.body);
    return res.status(200).json({ message: "Mentor yangilandi", mentor });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByPk(req.params.id);
    if (!mentor) return res.status(404).json({ message: "Mentor topilmadi" });

    await mentor.destroy();
    return res.status(200).json({ message: "Mentor o'chirildi", id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
