const { Product } = require("../models");
const deleteFile = require("../middleware/deleteFile");

exports.createProduct = async (req, res) => {
  try {
    // Rasm URL sini tayyorlaymiz (Multer-S3 ishlatilsa .location bo'ladi)
    const image_url = req.file ? req.file.location : req.body.image_url;

    // String holatda kelgan JSONlarni (multilingual fields) obyektga aylantiramiz
    let title = req.body.title;
    let description = req.body.description;
    let technologies = req.body.technologies;

    try {
      if (typeof title === 'string') title = JSON.parse(title);
      if (typeof description === 'string') description = JSON.parse(description);
      if (typeof technologies === 'string') technologies = JSON.parse(technologies);
    } catch (e) {
      // Parse xatosi bo'lsa o'z holicha qoladi
    }

    const productData = {
      ...req.body,
      title,
      description,
      technologies,
      image_url,
    };

    // Validatsiya qismi olib tashlandi

    // Mahsulot yaratish
    const product = await Product.create(productData);

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["order", "ASC"]],
      where: { is_active: true },
    });
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateProduct = async (req, res) => {
  // Validatsiya qismi olib tashlandi

  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    // Default: eski rasm saqlanadi
    let image_url = product.image_url;

    // Agar yangi rasm yuklangan bo'lsa
    if (req.file) {
      if (product.image_url) {
        try {
          const oldKey = product.image_url.split(".amazonaws.com/")[1];
          if (oldKey) await deleteFile(oldKey);
        } catch (s3Error) {
          console.warn("Old image deletion failed:", s3Error.message);
        }
      }
      image_url = req.file.location;
    }

    // Kelayotgan ma'lumotlarni parse qilish
    let title = req.body.title || product.title;
    let description = req.body.description || product.description;
    let technologies = req.body.technologies || product.technologies;

    try {
      if (typeof title === 'string') title = JSON.parse(title);
      if (typeof description === 'string') description = JSON.parse(description);
      if (typeof technologies === 'string') technologies = JSON.parse(technologies);
    } catch (e) {}

    // DB ni yangilash
    await product.update({
      ...req.body,
      title,
      description,
      technologies,
      image_url,
    });

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    // S3 faylni o'chirish
    if (product.image_url) {
      try {
        const key = product.image_url.split(".amazonaws.com/")[1];
        if (key) await deleteFile(key);
      } catch (s3Error) {
        console.warn("S3 deletion failed:", s3Error.message);
      }
    }

    const productData = product.toJSON();
    await product.destroy();

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProduct: productData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};