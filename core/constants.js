const config = require("config");
const { argv } = require("yargs");

exports.MONGODB = {
  uri: `mongodb://${config.get("db.name")}:${config.get(
    "db.pwd"
  )}@47.75.207.171:27017/best`,
  username: argv.MONGODB_BEST_NAME || "DB_username",
  password: argv.MONGODB_BEST_PWD || "DB_password",
};
