module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Faq", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "General",
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
};
