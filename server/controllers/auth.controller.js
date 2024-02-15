const config = require("../config/auth.config");
const { User } = require("../models/user.js");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');

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

function generateVerificationCode() {
    let code = Math.floor(Math.random() * 1000000);
    return String(code).padStart(6, '0');
}

async function sendCode(email, code) {
    return new Promise(async (resolve, reject) => {
        let transporter = nodemailer.createTransport({
            host: 'ydmsk.xyz', // 你的 SMTP 服务器地址
            port: 465, // SMTP 服务器的端口，通常是 587 或 465
            secure: true, // 如果端口是 465，需要将这个选项设置为 true
            auth: {
                user: 'potatores@ydmsk.xyz', // SMTP 服务器的用户名
                pass: 'sbwzs233' // SMTP 服务器的密码
            }
        });

        let mailOptions = {
            from: 'potatores@ydmsk.xyz', // 发件人地址
            to: email, // 收件人地址，可以是一个数组，表示多个收件人
            subject: '验证码', // 邮件主题
            text: `您的2FA验证码：${code}，5分钟内有效。` // 邮件内容
        };

        try {
            let info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            resolve();
        } catch (error) {
            console.error('Error sending email: ' + error);
            reject(new Error('发送邮件时遇到错误：' + error));
        }
    });
}

exports.login = (req, res) => {
    User.findOne({
        u_id: req.body.u_id,
    })
        .exec(async (err, user) => {
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

            /*
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
                            user
                        );
            */
            const verificationCode = generateVerificationCode();
            user.verificationCode = {
                code: verificationCode,
                lastSent: new Date(),
                expiration: new Date(Date.now().getMinutes() + 5), // 5 minutes
            };
            await user.save();

            // TODO: 发送验证码
            sendCode(user.u_id, verificationCode).then(() => {
                res.status(200).send({ message: "验证码已发送！" });
            })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send({ message: "验证码发送失败！" });
                });
        });
};

// 2FA
exports.requestCode = async (req, res) => {
    const { u_id } = req.body;

    try {
        const user = await User.findOne({ u_id: u_id });

        if (user.verificationCode.lastSent && new Date(user.verificationCode.lastSent.getMinutes() + 1) > new Date()) {
            return res.status(429).send({ message: "距离上次发送验证码还不足一分钟，请稍后再试。" });
        }

        const verificationCode = generateVerificationCode();

        user.verificationCode = {
            code: verificationCode,
            lastSent: new Date(),
            expiration: new Date(Date.now().getMinutes() + 5), // 5 minutes
        };
        await user.save();
        // TODO: 发送验证码
        sendCode(user.u_id, verificationCode).then(() => {
            res.status(200).send({ message: "验证码已重新发送！" });
        })
            .catch((error) => {
                console.error(error);
                res.status(500).send({ message: "验证码发送失败！" });
            });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


exports.verifyCode = (req, res) => {
    const { u_id, code } = req.body;

    User.findOne({ u_id: u_id })
        .exec(async (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (user.verificationCode && user.verificationCode.code === code && user.verificationCode.expiration > new Date()) {
                // 验证码有效
                user.verificationCode = undefined;
                await user.save();
                const token = jwt.sign({ id: user.u_id },
                    config.secret,
                    {
                        algorithm: 'HS256',
                        allowInsecureKeySizes: true,
                        expiresIn: 86400,
                    });

                req.session.token = token;

                const { u_id } = user;
                const strippedUser = { u_id };

                req.session.user = strippedUser;

                res.status(200).send(
                    user
                );
            } else {
                // 验证码无效或已过期
                res.status(401).send({ message: "验证码无效！" });
            }
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
