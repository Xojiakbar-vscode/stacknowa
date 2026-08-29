module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Review", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    studentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    reviewText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
