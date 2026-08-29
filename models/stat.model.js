module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Stat", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    label: {
      type: DataTypes.STRING, // e.g. 'O‘quvchilar'
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING, // e.g. '5000+'
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
};
