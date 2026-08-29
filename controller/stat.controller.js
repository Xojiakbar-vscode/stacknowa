const { Stat } = require("../models");

exports.getStats = async (req, res) => {
  try {
    const stats = await Stat.findAll({ order: [["orderIndex", "ASC"]] });
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateStat = async (req, res) => {
  try {
    const { id } = req.params;
    const stat = await Stat.findByPk(id);
    if (!stat) return res.status(404).json({ message: "Statistika topilmadi" });

    await stat.update(req.body);
    return res.status(200).json({ message: "Statistika yangilandi", stat });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createStat = async (req, res) => {
  try {
    const stat = await Stat.create(req.body);
    return res.status(201).json({ message: "Statistika yaratildi", stat });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
