module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define("Course", {
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
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fullDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING, // e.g. 'IT', 'Design', 'Marketing', 'English', 'Kids'
      allowNull: false,
      defaultValue: "IT",
    },
    duration: {
      type: DataTypes.STRING, // e.g. '6 oy'
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING, // e.g. 'Boshlovchilar uchun'
      defaultValue: "Boshlovchilar",
    },
    format: {
      type: DataTypes.STRING, // e.g. 'Offline', 'Online', 'Hybrid'
      defaultValue: "Offline",
    },
    price: {
      type: DataTypes.INTEGER, // Monthly price in UZS
      allowNull: true,
    },
    priceText: {
      type: DataTypes.STRING, // e.g. '1 200 000 so‘m / oy'
      allowNull: true,
    },
    schedule: {
      type: DataTypes.STRING, // e.g. 'Dushanba / Chorshanba / Juma (18:00 - 20:00)'
      allowNull: true,
    },
    startDate: {
      type: DataTypes.STRING, // e.g. '10-Sentabr'
      allowNull: true,
    },
    program: {
      type: DataTypes.JSON, // Array of modules: [{ module: 1, title: 'HTML & CSS', topics: ['Tags', 'Flexbox'] }]
      allowNull: true,
    },
    features: {
      type: DataTypes.JSON, // ['✓ Boshlovchilar uchun', '✓ Amaliy darslar']
      allowNull: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM("published", "draft"),
      defaultValue: "published",
    },
    mentorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  Course.associate = (models) => {
    Course.belongsTo(models.Mentor, {
      foreignKey: "mentorId",
      as: "mentor",
    });
    Course.hasMany(models.Lead, {
      foreignKey: "courseId",
      as: "leads",
    });
  };

  return Course;
};
