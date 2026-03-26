const { Product } = require("../models");
const { validateProduct } = require("../validation/productValidation");
const deleteFile = require("../middleware/deleteFile");

exports.createProduct = async (req, res) => {
  try {
    // Rasm URL sini tayyorlaymiz
    const image_url = req.file ? req.file.path : req.body.image_url;

    // Validator uchun body ni yangilaymiz
    const productData = {
      ...req.body,
      image_url,
    };

    // Validatsiya
    const { error } = validateProduct(productData);
    if (error) return res.status(400).send(error.details[0].message);

    // Mahsulot yaratish
    const product = await Product.create(productData);

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
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
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    // Default: eski rasm saqlanadi
    let image_url = product.image_url;

    // Agar yangi rasm yuklangan bo'lsa
    if (req.file) {
      // 1️⃣ Eski rasmni S3 dan o'chirish
      if (product.image_url) {
        try {
          const oldKey = product.image_url.split(".amazonaws.com/")[1];
          if (oldKey) await deleteFile(oldKey);
        } catch (s3Error) {
          console.warn("Old image deletion failed:", s3Error.message);
        }
      }
      // 2️⃣ Yangi rasm URL ni DB ga qo'yish
      image_url = req.file.location; // multer-s3 bilan location mavjud
    }

    // 3️⃣ DB ni yangilash
    await product.update({
      ...req.body,
      image_url,
    });

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
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