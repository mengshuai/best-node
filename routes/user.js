const User = require("../models/user");
const consola = require("consola");

import { MD5_SUFFIX, responseClient, md5 } from "../utils/helper.js";

exports.register = (req, res) => {
  // req的数据格式
  consola.warn("req content-type:", req.headers["content-type"]);
  consola.warn("req.method:", req.method);
  consola.warn("req.body:", req.body);

  let { name, password, phone, email, introduce, type } = req.body;
  if (!email) {
    responseClient(res, 400, 2, "用户邮箱不可为空");
    return;
  }
  const reg = new RegExp(
    "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"
  ); //正则表达式
  if (!reg.test(email)) {
    responseClient(res, 400, 2, "请输入格式正确的邮箱！");
    return;
  }
  if (!name) {
    responseClient(res, 400, 2, "用户名不可为空");
    return;
  }
  if (!password) {
    responseClient(res, 400, 2, "密码不可为空");
    return;
  }
  //验证用户是否已经在数据库中
  User.findOne({ email: email })
    .then((data) => {
      if (data) {
        responseClient(res, 200, 1, "用户邮箱已存在！");
        return;
      }
      //保存到数据库
      let user = new User({
        email,
        name,
        password: md5(password + MD5_SUFFIX),
        phone,
        type,
        introduce,
      });
      user.save().then((data) => {
        responseClient(res, 200, 0, "注册成功", data);
      });
    })
    .catch((err) => {
      responseClient(res);
      return;
    });
};
exports.login = (req, res) => {
  let { email, password } = req.body || {};
  if (!email) {
    responseClient(res, 400, 2, "用户邮箱不可为空");
    return;
  }
  if (!password) {
    responseClient(res, 400, 2, "密码不可为空");
    return;
  }
  User.findOne({
    email,
    password: md5(password + MD5_SUFFIX),
  })
    .then((userInfo) => {
      if (userInfo) {
        //登录成功后设置session
        // req.session.userInfo = userInfo;
        responseClient(res, 200, 0, "登录成功", userInfo);
      } else {
        responseClient(res, 400, 1, "用户名或者密码错误");
      }
    })
    .catch((err) => {
      responseClient(res);
    });
};
//后台当前用户
exports.currentUser = (req, res) => {
  let user = {};
  user.avatar = "http://p61te2jup.bkt.clouddn.com/WechatIMG8.jpeg";
  user.notifyCount = 0;
  user.address = "广东省";
  user.country = "China";
  user.group = "BiaoChenXuying";
  (user.title = "交互专家"), (user.signature = "海纳百川，有容乃大");
  user.tags = [];
  user.geographic = {
    province: {
      label: "广东省",
      key: "330000",
    },
    city: {
      label: "广州市",
      key: "330100",
    },
  };
  responseClient(res, 200, 0, "", user);
};
