const Sequelize = require("sequelize");
const sequelize = require("../config/databse");

// faqat hozirgi modellaring
const HomeBanner = require("./homeBanner.model")(sequelize, Sequelize);
const Product = require("./product.model")(sequelize, Sequelize);
const Service = require("./service.model")(sequelize, Sequelize);
const Testimonial = require("./testimonial.model")(sequelize, Sequelize);
const Admin = require("./Admin")(sequelize, Sequelize);

// agar future’da relation qo‘shsang
if (HomeBanner.associate) HomeBanner.associate(sequelize.models);
if (Product.associate) Product.associate(sequelize.models);
if (Service.associate) Service.associate(sequelize.models);
if (Testimonial.associate) Testimonial.associate(sequelize.models);
if (Admin.associate) Admin.associate(sequelize.models);

// export
module.exports = {
  sequelize,
  Sequelize,

  HomeBanner,
  Product,
  Service,
  Testimonial,
  Admin
};