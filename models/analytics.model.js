module.exports = (sequelize, DataTypes) => {
  return sequelize.define("AnalyticsEvent", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    eventName: {
      type: DataTypes.STRING, // 'Page View', 'CTA Click', 'Course Click', 'Form Submit', 'Phone Click', 'Telegram Click', 'WhatsApp Click'
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING, // 'Landing', 'Course Page', 'Popup', 'Event'
      allowNull: true,
    },
    pageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metaJson: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
};
