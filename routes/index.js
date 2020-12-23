const user = require("./user");

module.exports = (app) => {
  app.post("/api/register", user.register);
  app.post("/api/login", user.login);
  app.get("/api/currentUser", user.currentUser);
};
