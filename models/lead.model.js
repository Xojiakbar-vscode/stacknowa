module.exports = (sequelize, DataTypes) => {
  const Lead = sequelize.define("Lead", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: "Landing",
    },
    status: {
      type: DataTypes.ENUM("New", "Contacted", "Interested", "Registered", "Rejected"),
      defaultValue: "New",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Lead.associate = (models) => {
    Lead.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
    Lead.belongsTo(models.Event, {
      foreignKey: "eventId",
      as: "event",
    });
  };

  return Lead;
};
