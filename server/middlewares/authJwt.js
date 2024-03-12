const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const User = require("../models/user.js");

verifyToken = (req, res, next) => {
  let token = req.session.token;

  if (!token) {
    return res.status(403).send({ message: "没有找到令牌！" });
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "令牌无效！",
      });
    }
    const decodedId = decoded.id;
    req.userId = decodedId;
    await User.findOne({ u_id: decodedId }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        res.status(403).send({ message: "用户不存在！" });
        return;
      }
      if (user.banned === 1) {
        res.status(403).send({ message: "用户已被封禁！" });
        return;
      }
    });
    next();
  });
};

// TODO: 确定/规范角色认证方式
/*
isEventManager = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (user.role === 1) {
            next();
            return;
        }
        res.status(403).send({ message: "需要活动管理员权限！" });
        return;
    });
};
*/

hasExecutiveManagerPrivileges = async (req, res, next) => {
  await User.findOne({ u_id: req.userId }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user.role >= 1) {
      next();
      return;
    }
    res.status(403).send({ message: "权限不足！" });
    return;
  });
};

isSysAdmin = async (req, res, next) => {
  await User.findOne({ u_id: req.userId }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user.role === 2) {
      next();
      return;
    }
    res.status(403).send({ message: "权限不足！" });
    return;
  });
};

const authJwt = {
  verifyToken,
  // isEventManager,
  hasExecutiveManagerPrivileges,
  isSysAdmin,
};

module.exports = authJwt;
