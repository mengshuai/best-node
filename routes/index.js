const user = require("./user");

module.exports = (app) => {
  app.post("/api/register", user.register);
  app.post("/api/login", user.login);
  app.post("/api/updateUser", user.updateUser);

  app.get("/api/currentUser", user.currentUser);
  app.get("/api/getUserList", user.getUserList);
};
