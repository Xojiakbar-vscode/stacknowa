const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user.model")(sequelize, Sequelize);
const Course = require("./course.model")(sequelize, Sequelize);
const Event = require("./event.model")(sequelize, Sequelize);
const Mentor = require("./mentor.model")(sequelize, Sequelize);
const Lead = require("./lead.model")(sequelize, Sequelize);
const Review = require("./review.model")(sequelize, Sequelize);
const Result = require("./result.model")(sequelize, Sequelize);
const Gallery = require("./gallery.model")(sequelize, Sequelize);
const AnalyticsEvent = require("./analytics.model")(sequelize, Sequelize);
const Stat = require("./stat.model")(sequelize, Sequelize);
const Faq = require("./faq.model")(sequelize, Sequelize);
const GrantExam = require("./grantExam.model")(sequelize, Sequelize);
const GrantQuestion = require("./grantQuestion.model")(sequelize, Sequelize);
const GrantParticipant = require("./grantParticipant.model")(sequelize, Sequelize);

// Setup model associations
const models = {
  User,
  Course,
  Event,
  Mentor,
  Lead,
  Review,
  Result,
  Gallery,
  AnalyticsEvent,
  Stat,
  Faq,
  GrantExam,
  GrantQuestion,
  GrantParticipant,
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  ...models,
  sequelize,
  Sequelize,
};
