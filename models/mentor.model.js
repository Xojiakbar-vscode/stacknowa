module.exports = (sequelize, DataTypes) => {
  const Mentor = sequelize.define("Mentor", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING, // e.g. 'Frontend Developer'
      allowNull: false,
    },
    experience: {
      type: DataTypes.STRING, // e.g. '5+ yillik tajriba'
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialLinks: {
      type: DataTypes.JSON, // e.g. { telegram: '...', linkedin: '...', github: '...' }
      allowNull: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  Mentor.associate = (models) => {
    Mentor.hasMany(models.Course, {
      foreignKey: "mentorId",
      as: "courses",
    });
  };

  return Mentor;
};
