const { Course, Mentor } = require("../models");
const { validateCourse } = require("../validation/courseValidation");
const { Op } = require("sequelize");

// Helper to generate slug from title
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

exports.createCourse = async (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const slug = req.body.slug || `${slugify(req.body.title)}-${Date.now()}`;
    const mentorId = req.body.mentorId ? Number(req.body.mentorId) : null;
    const course = await Course.create({
      ...req.body,
      mentorId,
      slug,
    });
    return res.status(201).json({ message: "Kurs yaratildi", course });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const { category, search, featured, status } = req.query;
    const where = {};

    if (category && category !== "Barchasi") {
      where.category = category;
    }
    if (featured === "true") {
      where.isFeatured = true;
    }
    if (status) {
      where.status = status;
    } else {
      // By default show published to public
      where.status = "published";
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const courses = await Course.findAll({
      where,
      include: [{ model: Mentor, as: "mentor", attributes: ["id", "fullName", "role", "photoUrl", "experience"] }],
      order: [["orderIndex", "ASC"], ["createdAt", "DESC"]],
    });

    return res.status(200).json(courses);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getCourseBySlugOrId = async (req, res) => {
  try {
    const { identifier } = req.params;
    let course;

    if (!isNaN(identifier)) {
      course = await Course.findByPk(identifier, {
        include: [{ model: Mentor, as: "mentor" }],
      });
    } else {
      course = await Course.findOne({
        where: { slug: identifier },
        include: [{ model: Mentor, as: "mentor" }],
      });
    }

    if (!course) return res.status(404).json({ message: "Kurs topilmadi" });

    const courseData = course.toJSON();
    if (!courseData.fullDescription) {
      courseData.fullDescription = `## ${courseData.title} Haqida Mashg'ulotlar va Amaliyot
Ushbu kurs davomida siz sohaning eng zamonaviy bilimlari va amaliy ko'nikmalarini egallaysiz.

### Kursning Asosiy Afzalliklari:
- 100% Amaliy mashg'ulotlar va real loyihalar ustida ishlash
- Tajribali mentorlar va ustozlar tomonidan har bir o'quvchiga individual yondashuv
- Portfolio uchun tayyor loyihalar yaratish va sertifikat topshirish
- Dars jarayonida zamonaviy vositalar va texnologiyalardan foydalanish`;
    }

    return res.status(200).json(courseData);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: "Kurs topilmadi" });

    if (req.body.title && req.body.title !== course.title && !req.body.slug) {
      req.body.slug = `${slugify(req.body.title)}-${Date.now()}`;
    }

    const mentorId = req.body.mentorId ? Number(req.body.mentorId) : null;
    await course.update({
      ...req.body,
      mentorId,
    });
    return res.status(200).json({ message: "Kurs yangilandi", course });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: "Kurs topilmadi" });

    await course.destroy();
    return res.status(200).json({ message: "Kurs o'chirildi", id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
