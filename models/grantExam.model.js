module.exports = (sequelize, DataTypes) => {
  const GrantExam = sequelize.define("GrantExam", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Stacknowa Academy 100% Grant Imtihoni",
    },
    examDate: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "25-Sentabr, 2026",
    },
    examTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "14:00",
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Namangan shahri, Bank ko'chasi (sobiq Bankovskaya), 9-uy. Mo'ljal: \"Kosmos\" oshxonasi (kafe) orqasida",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "+998 20 014 66 67",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seatsTotal: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    seatsLeft: {
      type: DataTypes.INTEGER,
      defaultValue: 35,
    },
    status: {
      type: DataTypes.ENUM("upcoming", "active", "finished"),
      defaultValue: "upcoming",
    },
    telegramBotUrl: {
      type: DataTypes.STRING,
      defaultValue: "https://t.me/stacknowa_academy_grand_bot",
    },
  });

  return GrantExam;
};
