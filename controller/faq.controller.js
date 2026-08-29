const { Faq } = require("../models");

exports.getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.findAll({ order: [["orderIndex", "ASC"]] });
    return res.status(200).json(faqs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createFaq = async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    return res.status(201).json({ message: "FAQ yaratildi", faq });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ topilmadi" });

    await faq.update(req.body);
    return res.status(200).json({ message: "FAQ yangilandi", faq });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ topilmadi" });

    await faq.destroy();
    return res.status(200).json({ message: "FAQ o'chirildi", id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
