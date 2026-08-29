module.exports = (sequelize, DataTypes) => {
  const GrantParticipant = sequelize.define("GrantParticipant", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    telegramId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    passed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // true if score >= 70
    },
    status: {
      type: DataTypes.ENUM("started", "completed"),
      defaultValue: "completed",
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return GrantParticipant;
};
