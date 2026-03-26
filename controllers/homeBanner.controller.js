const { HomeBanner } = require("../models");
const { validateHomeBanner } = require("../validation/homeBannerValidation");
const deleteFile = require("../middleware/deleteFile")

exports.createBanner = async (req, res) => {
  try {
    // rasm URL sini tayyorlaymiz
    const image_url = req.file ? req.file.location : req.body.image_url;

    // Validator uchun body ni yangilaymiz
    const bannerData = {
      ...req.body,
      image_url,
    };

    // Validatsiya
    const { error } = validateHomeBanner(bannerData);
    if (error) return res.status(400).send(error.details[0].message);

    // Banner yaratish
    const banner = await HomeBanner.create(bannerData);

    return res.status(201).json({
      message: "Banner created successfully",
      banner,
    });
  } catch (err) {
    return res.status(500).send(err.message);
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
  // 1️⃣ Validation
  const { error } = validateHomeBanner(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // 2️⃣ DB-dan banner topish
    const banner = await HomeBanner.findByPk(req.params.id);
    if (!banner) return res.status(404).send("Banner not found");

    // 3️⃣ Agar yangi rasm kelsa, eski rasmni S3-dan o'chirish va yangi rasmni saqlash
    let image_url = banner.image_url; // default: eski rasm

    if (req.file) {
      // Yangi rasm yuklandi
      // 3a: eski rasmni S3 dan o'chirish
      if (banner.image_url) {
        try {
          const oldKey = banner.image_url.split(".amazonaws.com/")[1];
          if (oldKey) await deleteFile(oldKey);
        } catch (s3Error) {
          console.warn("Old image deletion failed:", s3Error.message);
        }
      }
      // 3b: yangi rasmni DB-ga qo'yish
      image_url = req.file.location; // multer-s3 bilan location mavjud
    }

    // 4️⃣ DB-ni yangilash
    await banner.update({
      ...req.body,
      image_url,
    });

    // 5️⃣ Response
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
    // 1️⃣ DB dan bannerni topish
    const banner = await HomeBanner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // 2️⃣ S3-dan rasmni o'chirish
    if (banner.image_url) {
      try {
        // URL dan S3 key ajratish
        const key = banner.image_url.split(".amazonaws.com/")[1];
        if (key) await deleteFile(key);
      } catch (s3Error) {
        console.warn("S3 deletion failed:", s3Error.message);
      }
    }

    // 3️⃣ DB dan o'chirish
    const bannerData = banner.toJSON();
    await banner.destroy();

    // 4️⃣ Response
    res.status(200).json({
      message: "Banner deleted successfully",
      deletedBanner: bannerData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};