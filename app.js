const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

// import 等语法要用到 babel 支持
require("babel-register");

const mongodb = require("./core/mongodb");

// data server
mongodb.connect();

var bodyParser = require("body-parser");

//body parser before routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(cookieParser("best_node_cookie"));
app.use(
  session({
    secret: "best_node_cookie",
    name: "session_id", //# 在浏览器中生成cookie的名称key，默认是connect.sid
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 1000 * 30, httpOnly: true }, //过期时间
  })
);

//将路由文件引入
const route = require("./routes/index");

//初始化所有路由
route(app);

module.exports = app;
