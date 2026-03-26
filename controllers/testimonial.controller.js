const { Testimonial } = require("../models");
const deleteFile = require("../middleware/deleteFile");

exports.createTestimonial = async (req, res) => {
  try {
    // Rasm URL sini tayyorlaymiz (S3 uchun .location ishlatiladi)
    const image_url = req.file ? req.file.location : req.body.image_url;

    // String holatda kelgan JSONlarni (multilingual) obyektga aylantiramiz
    let customer_name = req.body.customer_name;
    let company_name = req.body.company_name;
    let description = req.body.description;

    try {
      if (typeof customer_name === 'string') customer_name = JSON.parse(customer_name);
      if (typeof company_name === 'string' && company_name !== "") company_name = JSON.parse(company_name);
      if (typeof description === 'string') description = JSON.parse(description);
    } catch (e) {
      // JSON formatida bo'lmasa o'z holicha qoladi
    }

    const testimonialData = {
      ...req.body,
      customer_name,
      company_name,
      description,
      image_url,
      // Ratingni raqam ekanligiga ishonch hosil qilamiz
      rating: Number(req.body.rating) || 5,
    };

    // Validatsiya qismi olib tashlandi

    // Testimonial yaratish
    const testimonial = await Testimonial.create(testimonialData);

    return res.status(201).json({
      message: "Testimonial created successfully",
      testimonial,
    });
  } catch (err) {
    console.error(err);
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
  // Validatsiya qismi olib tashlandi

  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).send("Testimonial not found");

    // Default: eski rasm saqlanadi
    let image_url = testimonial.image_url;

    // Agar yangi rasm yuklangan bo'lsa
    if (req.file) {
      if (testimonial.image_url) {
        try {
          const oldKey = testimonial.image_url.split(".amazonaws.com/")[1];
          if (oldKey) await deleteFile(oldKey);
        } catch (s3Error) {
          console.warn("Old image deletion failed:", s3Error.message);
        }
      }
      image_url = req.file.location;
    }

    // Kelayotgan ma'lumotlarni parse qilish
    let customer_name = req.body.customer_name || testimonial.customer_name;
    let company_name = req.body.company_name || testimonial.company_name;
    let description = req.body.description || testimonial.description;

    try {
      if (typeof customer_name === 'string') customer_name = JSON.parse(customer_name);
      if (typeof company_name === 'string' && company_name !== "") company_name = JSON.parse(company_name);
      if (typeof description === 'string') description = JSON.parse(description);
    } catch (e) {}

    // DB ni yangilash
    await testimonial.update({
      ...req.body,
      customer_name,
      company_name,
      description,
      image_url,
      rating: req.body.rating ? Number(req.body.rating) : testimonial.rating,
    });

    res.status(200).json({
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) return res.status(404).send("Testimonial not found");

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