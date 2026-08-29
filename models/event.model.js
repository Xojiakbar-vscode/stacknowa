module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define("Event", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    eventDate: {
      type: DataTypes.STRING, // e.g. '15-Sentabr, 2026'
      allowNull: false,
    },
    eventTime: {
      type: DataTypes.STRING, // e.g. '15:00'
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING, // e.g. 'Toshkent sh., Chilonzor 5-mavze'
      allowNull: false,
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fullDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    eventType: {
      type: DataTypes.ENUM("Workshop", "Masterclass", "Open Day", "Seminar", "Hackathon", "Meetup"),
      defaultValue: "Workshop",
    },
    price: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    seatsTotal: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    seatsLeft: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    status: {
      type: DataTypes.ENUM("upcoming", "active", "finished", "cancelled"),
      defaultValue: "upcoming",
    },
    telegramBotUrl: {
      type: DataTypes.STRING,
      defaultValue: "https://t.me/stacknowa_academy_bot",
    },
  });

  Event.associate = (models) => {
    Event.hasMany(models.Lead, {
      foreignKey: "eventId",
      as: "leads",
    });
  };

  return Event;
};
