const { Result } = require("../models");

exports.createResult = async (req, res) => {
  try {
    const result = await Result.create(req.body);
    return res.status(201).json({ message: "Natija yaratildi", result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) return res.status(404).json({ message: "Natija topilmadi" });

    await result.update(req.body);
    return res.status(200).json({ message: "Natija yangilandi", result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) return res.status(404).json({ message: "Natija topilmadi" });

    await result.destroy();
    return res.status(200).json({ message: "Natija o'chirildi", id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
