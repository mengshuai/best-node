const express = require("express");
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

//将路由文件引入
const route = require("./routes/index");

//初始化所有路由
route(app);

module.exports = app;
