const { Testimonial } = require("../models");
const { validateTestimonial } = require("../validation/testimonialValidation");
const deleteFile = require("../middleware/deleteFile");

exports.createTestimonial = async (req, res) => {
  try {
    // Rasm URL sini tayyorlaymiz
    const image_url = req.file ? req.file.path : req.body.image_url;

    const testimonialData = {
      ...req.body,
      image_url,
    };

    // Validatsiya
    const { error } = validateTestimonial(testimonialData);
    if (error) return res.status(400).send(error.details[0].message);

    // Testimonial yaratish
    const testimonial = await Testimonial.create(testimonialData);

    return res.status(201).json({
      message: "Testimonial created successfully",
      testimonial,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [["order", "ASC"]],
      where: { is_active: true },
    });
    res.status(200).send(testimonials);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).send("Testimonial not found");
    res.status(200).send(testimonial);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateTestimonial = async (req, res) => {
  const { error } = validateTestimonial(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).send("Testimonial not found");

    // Default: eski rasm saqlanadi
    let image_url = testimonial.image_url;

    // Agar yangi rasm yuklangan bo'lsa
    if (req.file) {
      // 1️⃣ Eski rasmni S3 dan o'chirish
      if (testimonial.image_url) {
        try {
          const oldKey = testimonial.image_url.split(".amazonaws.com/")[1];
          if (oldKey) await deleteFile(oldKey);
        } catch (s3Error) {
          console.warn("Old image deletion failed:", s3Error.message);
        }
      }
      // 2️⃣ Yangi rasmni DB ga qo'yish
      image_url = req.file.location; // multer-s3 bilan location mavjud
    }

    // 3️⃣ DB ni yangilash
    await testimonial.update({
      ...req.body,
      image_url,
    });

    res.status(200).json({
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).send("Testimonial not found");

    // S3 faylni o'chirish
    if (testimonial.image_url) {
      try {
        const key = testimonial.image_url.split(".amazonaws.com/")[1];
        if (key) await deleteFile(key);
      } catch (s3Error) {
        console.warn("S3 deletion failed:", s3Error.message);
      }
    }

    const testimonialData = testimonial.toJSON();
    await testimonial.destroy();

    res.status(200).json({
      message: "Testimonial deleted successfully",
      deletedTestimonial: testimonialData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};