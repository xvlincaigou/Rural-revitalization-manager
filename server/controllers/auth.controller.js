const config = require("../config/auth.config");
// const db = require("../models");
const { User } = require("../models/user.js"); // 调试用
// const Role = db.role;

// var session = require("express-session"); // library that stores info about each connected user
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.register = (req, res) => {
    // TODO: 注册码核验

    // 使用 $or 查询多个字段是否唯一
    // TODO: 需要与前端沟通变量名称及类型
    User.findOne({
        $or: [
            { name: req.body.name },
            { u_id: req.body.u_id },
            { phone_number: req.body.phone_number },
            { id_number: req.body.id_number }
        ]
    }, (err, existingUser) => {
        if (err) {
            return res.status(500).send({ message: err });
        }

        if (existingUser) {
            // 构建一个包含重复字段的数组
            const duplicateFields = [];
            if (existingUser.name === req.body.name) {
                duplicateFields.push('姓名');
            }
            if (existingUser.u_id === req.body.u_id) {
                duplicateFields.push('电子邮件');
            }
            if (existingUser.phone_number === req.body.phone_number) {
                duplicateFields.push('电话号码');
            }
            if (existingUser.id_number === req.body.id_number) {
                duplicateFields.push('身份证号');
            }

            // 返回带有重复字段信息的响应
            return res.status(400).send({ message: `以下字段重复：${duplicateFields.join('，')}。` });
        }

        // 如果用户名、电子邮件、电话号码和身份证号都不存在重复，继续创建用户
        const user = new User({
            name: req.body.name,
            u_id: req.body.u_id,
            phone_number: req.body.phone_number,
            id_number: req.body.id_number, // TODO: 沟通敏感信息安全性问题
            password: bcrypt.hashSync(req.body.password, 8),
        });

        user.save((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (req.body.role) {
                user.role = req.body.role;
                user.save((err) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                });
            }
            res.send({ message: "用户注册成功！" });
        });
    });
};



exports.login = (req, res) => {
    User.findOne({
        u_id: req.body.u_id,
    })
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            
            if (!user) {
                return res.status(404).send({ message: "没有找到用户！" });
            }
            // TODO:2FA
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({ message: "密码错误！" });
            }

            const token = jwt.sign({ id: user.u_id },
                config.secret,
                {
                    algorithm: 'HS256',
                    allowInsecureKeySizes: true,
                    expiresIn: 86400, // TODO: 决定令牌有效期
                });

            req.session.token = token;

            const { u_id } = user;
            const strippedUser = { u_id };

            req.session.user = strippedUser;

            res.status(200).send(
                /*
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                */
                strippedUser
            );
        });
};

exports.logout = async (req, res) => {
    try {
        req.session = null;
        req.session.user = null;

        /*
        const userSocket = socketManager.getSocketFromUserID(req.user.u_id);
        if (userSocket) {
            // delete user's socket if they logged out
            socketManager.removeUser(req.user, userSocket);
        }
        */
        res.send({});
    } catch (err) {
        this.next(err);
    }
};

exports.populateCurrentUser = (req, res, next) => {
    // simply populate "req.user" for convenience
    req.user = req.session.user;
    next();
}


exports.ensureLoggedIn = (req, res, next) => {
    if (!req.user) {
        return res.status(401).send({ err: "没有登陆。" });
    }

    next();
}
