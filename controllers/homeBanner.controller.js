const { HomeBanner } = require("../models");
const deleteFile = require("../middleware/deleteFile");

exports.createBanner = async (req, res) => {
  try {
    const image_url = req.file ? req.file.location : req.body.image_url;

    // String holatda kelgan JSONlarni obyektga aylantiramiz (bazaga JSON tipida saqlash uchun)
    let title = req.body.title;
    let description = req.body.description;

    try {
      if (typeof title === 'string') title = JSON.parse(title);
      if (typeof description === 'string') description = JSON.parse(description);
    } catch (e) {
      // Agar JSON parse xato bersa, matnni o'zini qoldiradi
    }

    const bannerData = {
      ...req.body,
      title,
      description,
      image_url,
    };

    // Validation qismi olib tashlandi
    const banner = await HomeBanner.create(bannerData);
    res.status(201).json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server ichki xatosi: " + err.message);
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await HomeBanner.findAll({
      order: [["order", "ASC"]],
      where: { is_active: true },
    });
    res.status(200).send(banners);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await HomeBanner.findByPk(req.params.id);
    if (!banner) return res.status(404).send("Banner not found");
    res.status(200).send(banner);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateBanner = async (req, res) => {
  try {
    // 1️⃣ DB-dan banner topish
    const banner = await HomeBanner.findByPk(req.params.id);
    if (!banner) return res.status(404).send("Banner not found");

    // 2️⃣ Rasm bilan ishlash
    let image_url = banner.image_url;

    if (req.file) {
      if (banner.image_url) {
        try {
          const oldKey = banner.image_url.split(".amazonaws.com/")[1];
          if (oldKey) await deleteFile(oldKey);
        } catch (s3Error) {
          console.warn("Old image deletion failed:", s3Error.message);
        }
      }
      image_url = req.file.location;
    }

    // 3️⃣ JSONlarni parse qilish
    let title = req.body.title || banner.title;
    let description = req.body.description || banner.description;

    try {
      if (typeof title === 'string') title = JSON.parse(title);
      if (typeof description === 'string') description = JSON.parse(description);
    } catch (e) {}

    // 4️⃣ DB-ni yangilash
    await banner.update({
      ...req.body,
      title,
      description,
      image_url,
    });

    res.status(200).json({
      message: "Banner updated successfully",
      banner,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await HomeBanner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    if (banner.image_url) {
      try {
        const key = banner.image_url.split(".amazonaws.com/")[1];
        if (key) await deleteFile(key);
      } catch (s3Error) {
        console.warn("S3 deletion failed:", s3Error.message);
      }
    }

    const bannerData = banner.toJSON();
    await banner.destroy();

    res.status(200).json({
      message: "Banner deleted successfully",
      deletedBanner: bannerData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};