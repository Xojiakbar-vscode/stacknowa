module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define("Service", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.JSON, // Uch til: { uz, en, ru }
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.JSON, // Uch til: { uz, en, ru }
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    icon_code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Icon class or code (e.g., 'fa-solid fa-code')",
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

  return Service;
};