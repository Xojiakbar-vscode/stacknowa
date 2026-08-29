const { uploadToS3 } = require("../config/s3");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Rasm fayli kiritilmadi!" });
    }

    // Allowed folder categories: course, event, mentor, gallery, review
    const allowedFolders = ["course", "event", "mentor", "gallery", "review"];
    let folder = req.body.folder || "uploads";

    if (!allowedFolders.includes(folder)) {
      folder = "course"; // Default to course folder
    }

    const imageUrl = await uploadToS3(
      req.file.buffer,
      folder,
      req.file.originalname,
      req.file.mimetype
    );

    return res.status(200).json({
      message: "Rasm AWS S3 omboriga muvaffaqiyatli yuklandi 🚀",
      url: imageUrl,
      folder,
      originalName: req.file.originalname,
    });
  } catch (err) {
    console.error("AWS S3 Upload Error:", err);
    return res.status(500).json({ message: "Fayl yuklashda xatolik: " + err.message });
  }
};
