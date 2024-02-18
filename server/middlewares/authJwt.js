const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const User = require("../models/user.js"); // 调试用

verifyToken = (req, res, next) => {
    let token = req.session.token;

    if (!token) {
        return res.status(403).send({ message: "没有找到token！" });
    }

    jwt.verify(token,
        config.secret,
        (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "权限不足！",
                });
            }
            req.userId = decoded.id;
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

isExecutiveManager = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
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

isSysAdmin = (req, res, next) => {
    User.findOne({ u_id: req.userId }).exec((err, user) => {
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
    isEventManager,
    isExecutiveManager,
    isSysAdmin,
};
module.exports = authJwt;