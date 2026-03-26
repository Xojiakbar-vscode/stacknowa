module.exports = (sequelize, DataTypes) => {
  const HomeBanner = sequelize.define("HomeBanner", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.JSON, // JSON tipida uchta til
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      // Misol: { uz: "Salom", en: "Hello", ru: "Привет" }
    },
    description: {
      type: DataTypes.JSON, // JSON tipida uchta til
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      // Misol: { uz: "Tavsif", en: "Description", ru: "Описание" }
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    button_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    button_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  return HomeBanner;
};