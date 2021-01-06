const User = require("../models/user");
const _ = require("lodash");
const consola = require("consola");

import { MD5_SUFFIX, responseClient, md5 } from "../utils/helper.js";
//用户注册
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
//用户登录
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
        req.session.userInfo = userInfo;
        let data = {
          status: "ok",
          currentAuthority: userInfo.currentAuthority,
        };
        responseClient(res, 200, 0, "登录成功", data);
      } else {
        responseClient(res, 400, 1, "用户名或者密码错误");
      }
    })
    .catch((err) => {
      responseClient(res);
    });
};
//退出登录
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
//用户验证
exports.currentUser = (req, res) => {
  const reqUserInfo = req.session.userInfo;
  if (reqUserInfo) {
    const { email } = reqUserInfo;
    User.findOne({
      email,
    })
      .then((userInfo) => {
        if (userInfo) {
          var infoData = userInfo;
          infoData.id = userInfo._id;
          infoData.userid = userInfo._id;
          responseClient(res, 200, 0, "", infoData);
        } else {
          responseClient(
            res,
            400,
            1,
            `该用户「${email}」不存在请重新登录`,
            reqUserInfo
          );
        }
      })
      .catch((err) => {
        responseClient(res);
      });
  } else {
    responseClient(res, 400, 1, "请重新登录", reqUserInfo);
  }
};
//获取用户列表
exports.getUserList = (req, res) => {
  let keyword = req.query.keyword || "";
  let pageNum = parseInt(req.query.pageNum) || 1;
  let pageSize = parseInt(req.query.pageSize) || 10;
  let conditions = {};
  if (keyword) {
    const reg = new RegExp(keyword, "i");
    conditions = {
      $or: [{ name: { $regex: reg } }, { email: { $regex: reg } }],
    };
  }
  let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
  let responseData = {
    total: 0,
    list: [],
    current: pageNum,
    pageSize,
  };
  User.countDocuments({}, (err, count) => {
    if (err) {
      console.error("Error:" + err);
    } else {
      responseData.total = count;
      // 待返回的字段
      let fields = {
        _id: 1,
        id: 1,
        email: 1,
        name: 1,
        avatar: 1,
        phone: 1,
        introduce: 1,
        type: 1,
        create_time: 1,
        update_time: 1,
        currentAuthority: 1,
      };
      let options = {
        skip: skip,
        limit: pageSize,
        sort: { create_time: -1 },
      };
      User.find(conditions, fields, options, (error, result) => {
        if (err) {
          console.error("Error:" + error);
          // throw error;
        } else {
          responseData.list = result;
          responseClient(res, 200, 0, "success", responseData);
        }
      });
    }
  });
};

//更新用户信息
exports.updateUser = (req, res) => {
  const userInfo = req.session.userInfo;
  if (!userInfo) {
    responseClient(res, 200, 1, "您还没登录,或者登录信息已过期，请重新登录！");
    return;
  }
  let {
    id,
    github_id,
    name,
    phone,
    img_url,
    email,
    introduce,
    avatar,
    location,
    password,
    currentAuthority,
  } = req.body;
  if (userInfo.id !== id && userInfo.currentAuthority !== "admin") {
    responseClient(res, 200, 1, "您没有权限修改其他人账号信息");
    return;
  }
  const data = {
    github_id,
    name,
    phone,
    img_url,
    email,
    introduce,
    avatar,
    location,
    password: password ? md5(password + MD5_SUFFIX) : undefined,
    currentAuthority,
  };
  User.updateOne({ _id: id }, _.pickBy(data, _.identity))
    .then((result) => {
      responseClient(res, 200, 0, "操作成功", result);
    })
    .catch((err) => {
      console.error("err:", err);
      responseClient(res);
    });
};
//删除用户
exports.delUser = (req, res) => {
  let { id } = req.body;
  User.deleteMany({ _id: id })
    .then((result) => {
      if (result.n === 1) {
        responseClient(res, 200, 0, "用户删除成功!");
      } else {
        responseClient(res, 200, 1, "用户不存在");
      }
    })
    .catch((err) => {
      responseClient(res);
    });
};
