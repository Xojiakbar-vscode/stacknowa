module.exports = (sequelize, DataTypes) => {
  const GrantQuestion = sequelize.define("GrantQuestion", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    optionA: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    optionB: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    optionC: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    optionD: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correctOption: {
      type: DataTypes.ENUM("A", "B", "C", "D"),
      allowNull: false,
      defaultValue: "A",
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  });

  return GrantQuestion;
};
