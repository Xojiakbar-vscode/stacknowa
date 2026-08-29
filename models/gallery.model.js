module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Gallery", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("Darslar", "Eventlar", "Bitiruvchilar", "Workshoplar", "O‘quv markaz"),
      defaultValue: "Darslar",
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
};
