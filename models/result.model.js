module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Result", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    studentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    beforeRole: {
      type: DataTypes.STRING, // e.g. 'Talaba'
      allowNull: false,
    },
    afterRole: {
      type: DataTypes.STRING, // e.g. 'Junior Frontend Developer (EPAM)'
      allowNull: false,
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    portfolioUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    story: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });
};
