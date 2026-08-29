const { Gallery } = require("../models");

exports.createGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.create(req.body);
    return res.status(201).json({ message: "Galereya rasmi qo'shildi", galleryItem });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};
    if (category && category !== "Barchasi") {
      where.category = category;
    }

    const items = await Gallery.findAll({
      where,
      order: [["orderIndex", "ASC"], ["createdAt", "DESC"]],
    });
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Rasm topilmadi" });

    await item.destroy();
    return res.status(200).json({ message: "Rasm o'chirildi", id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
