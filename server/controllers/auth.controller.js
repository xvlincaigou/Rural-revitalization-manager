const config = require("../config/auth.config");
// const db = require("../models");
const User = require("../models/user-WIP.js"); // 调试用
// const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    // 使用 $or 查询多个字段是否唯一
    // TO-DO: 需要与前端沟通变量名称及类型
    User.findOne({
        $or: [
            { username: req.body.username },
            { email: req.body.email },
            { phoneNumber: req.body.phoneNumber },
            { idNumber: req.body.idNumber }
        ]
    }, (err, existingUser) => {
        if (err) {
            return res.status(500).send({ message: err });
        }

        if (existingUser) {
            // 构建一个包含重复字段的数组
            const duplicateFields = [];
            if (existingUser.username === req.body.username) {
                duplicateFields.push('姓名');
            }
            if (existingUser.email === req.body.email) {
                duplicateFields.push('电子邮件');
            }
            if (existingUser.phoneNumber === req.body.phoneNumber) {
                duplicateFields.push('电话号码');
            }
            if (existingUser.idNumber === req.body.idNumber) {
                duplicateFields.push('身份证号');
            }

            // 返回带有重复字段信息的响应
            return res.status(400).send({ message: `以下字段重复：${duplicateFields.join(', ')}` });
        }

        // 如果用户名、电子邮件、电话号码和身份证号都不存在重复，继续创建用户
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            idNumber: req.body.idNumber, // TO-DO: 沟通敏感信息安全性问题
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



exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username,
    })
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            
            if (!user) {
                return res.status(404).send({ message: "没有找到用户！" });
            }
            // TO-DO:2FA
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({ message: "Invalid Password!" });
            }

            const token = jwt.sign({ id: user.id },
                config.secret,
                {
                    algorithm: 'HS256',
                    allowInsecureKeySizes: true,
                    expiresIn: 86400, // TO-DO: 决定令牌有效期
                });

            req.session.token = token;

            res.status(200).send({
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            });
        });
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "您已成功登出。" });
    } catch (err) {
        this.next(err);
    }
};