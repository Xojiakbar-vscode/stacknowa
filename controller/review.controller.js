const { Review } = require("../models");

exports.createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    return res.status(201).json({ message: "Fikr yaratildi", review });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { isPublished: true },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Fikr topilmadi" });

    await review.update(req.body);
    return res.status(200).json({ message: "Fikr yangilandi", review });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: "Fikr topilmadi" });

    await review.destroy();
    return res.status(200).json({ message: "Fikr o'chirildi", id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
