const config = require("../config/auth.config");
const User = require("../models/user.js");
const Settings = require("../models/settings.js");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const validator = require('validator');

// 初始化设置
async function initializeSettings() {
    const existingSettings = await Settings.findOne();

    if (!existingSettings) {
        const defaultSettings = new Settings();
        await defaultSettings.save();
    }
}

initializeSettings().catch(console.error);

exports.register = async (req, res) => {
    try {
        const { registration_code, name, u_id, phone_number, id_number, password } = req.body;
        const settings = await Settings.findOne();
        // 注册码核验
        // 检验req.body.registration_code是否在settings.availableRegistrationCodes中
        if (settings.availableRegistrationCodes && !settings.availableRegistrationCodes.includes(registration_code)) {
            return res.status(403).send({ message: "注册码无效！" });
        }

        // 删除已使用的注册码
        if (settings.availableRegistrationCodes && settings.availableRegistrationCodes.includes(registration_code)) {
            settings.availableRegistrationCodes = settings.availableRegistrationCodes.filter(code => code !== registration_code);
            await settings.save();
        }

        // 使用 $or 查询多个字段是否唯一
        // TODO: 需要与前端沟通变量名称及类型
        User.findOne({
            $or: [
                // { name: req.body.name },
                { u_id: u_id },
                { phone_number: phone_number },
                { id_number: id_number }
            ]
        }, (err, existingUser) => {
            if (err) {
                return res.status(500).send({ message: err });
            }

            if (existingUser) {
                // 构建一个包含重复字段的数组
                const duplicateFields = [];
                if (existingUser.u_id === u_id) {
                    duplicateFields.push('电子邮件');
                }
                if (existingUser.phone_number === phone_number) {
                    duplicateFields.push('电话号码');
                }
                if (existingUser.id_number === id_number) {
                    duplicateFields.push('身份证号');
                }

                // 返回带有重复字段信息的响应
                return res.status(400).send({ message: `以下字段重复：${duplicateFields.join('，')}。` });
            }

            // 校验数据合法性
            const usernamePattern = /^[\u4e00-\u9fa5A-Za-z]+$/;
            const idPattern = /^\d{17}[\dXx]$/
            const phoneNumberPattern = /^\d{11}$/;
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;

            if (!validator.isEmail(u_id)) {
                return res.status(400).send({ message: "电子邮件格式无效。" });
            }

            if (!usernamePattern.test(name)) {
                return res.status(400).send({ message: "姓名格式无效。" });
            }

            if (!phoneNumberPattern.test(phone_number)) {
                return res.status(400).send({ message: "电话号码格式无效。" });
            }

            if (!idPattern.test(id_number)) {
                return res.status(400).send({ message: "身份证号格式无效。" });
            }

            if (!passwordPattern.test(password)) {
                return res.status(400).send({ message: "密码格式不符合要求。" });
            }

            // 如果用户名、电子邮件、电话号码和身份证号都不存在重复，继续创建用户
            const user = new User({
                name: name,
                u_id: u_id,
                phone_number: phone_number,
                id_number: id_number, // TODO: 沟通敏感信息安全性问题
                password: bcrypt.hashSync(password, 8),
            });

            user.save((err, user) => {
                if (err) {
                    return res.status(500).send({ message: err });
                }

                if (req.body.role) {
                    user.role = req.body.role;
                    user.save((err) => {
                        if (err) {
                            return res.status(500).send({ message: err });
                        }
                    });
                }
                res.send({ message: "用户注册成功！" });
            });
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
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

            if (user.frozen && user.frozen.frozen) {
                if (new Date(user.frozen.lastFrozen.getTime() + 86400000) > new Date()) {
                    return res.status(401).send({ message: "您的帐户已被锁定，请稍后再试或联系管理员！" });
                } else {
                    user.frozen = { frozen: false, lastFrozen: null };
                    await user.save();
                }
            }

            // 2FA
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (user.banned === 1) {
                return res.status(403).send({ message: "您已被封禁，请联系管理员！" });
            }

            if (!passwordIsValid) {
                // 向failedLoginAttempts中添加一条记录，如果failedLoginAttempts中的记录数为5条，则删除最早的记录并添加本次记录，小于5条时直接添加即可，如果最晚的记录和最早的纪录间相差小于30分钟则封禁帐户
                if (user.failedLoginAttempts.length === 5) {
                    user.failedLoginAttempts.shift();
                    const now = new Date();
                    user.failedLoginAttempts.push(now);
                    if (new Date(user.failedLoginAttempts[0].getTime() + 1800000) > now) {
                        user.frozen = { frozen: true, lastFrozen: now };
                        await user.save();
                        return res.status(401).send({ message: "密码错误次数过多，您的账户已被锁定，请于24h后再试！" });
                    }
                } else {
                    user.failedLoginAttempts.push(new Date());
                    await user.save();
                }
                return res.status(401).send({ message: "密码错误！" });
            }

            if (!(user.verificationCode.lastSent && new Date(user.verificationCode.lastSent.getTime() + 60000) > new Date())) {
                const verificationCode = generateVerificationCode();
                let expirationDate = new Date();
                expirationDate.setMinutes(expirationDate.getMinutes() + 5);
                user.verificationCode = {
                    code: verificationCode,
                    lastSent: new Date(),
                    expiration: expirationDate // 5 minutes
                };
                await user.save();
                // 发送验证码
                sendCode(user.u_id, verificationCode).then(() => {
                    res.status(200).send({ message: "验证码已发送！" });
                })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send({ message: "验证码发送失败！" });
                    });
            } else {
                res.status(200).send({ message: "验证码已发送！" });
            }

        });
};

// 2FA
exports.requestCode = async (req, res) => {
    const { u_id } = req.body;

    try {
        const user = await User.findOne({ u_id: u_id });

        if (user.verificationCode.lastSent && new Date(user.verificationCode.lastSent.getTime() + 60000) > new Date()) {
            return res.status(200).send({ message: "距离上次发送验证码还不足1分钟，请稍后再试。" });
        }

        const verificationCode = generateVerificationCode();
        let expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 5);

        user.verificationCode = {
            code: verificationCode,
            lastSent: new Date(),
            expiration: expirationDate // 5 minutes
        };
        await user.save();
        // 发送验证码
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
                // user.verificationCode = undefined;
                await user.save();
                const token = jwt.sign({ id: user.u_id },
                    config.secret,
                    {
                        algorithm: 'HS256',
                        allowInsecureKeySizes: true,
                        expiresIn: 86400,
                    });

                req.session.token = token;

                const { name, u_id, role, activities, previous_scores, comment_received, tags, banned } = user;
                const strippedUser = { name, u_id, role, activities, previous_scores, comment_received, tags, banned };

                req.session.user = strippedUser;

                res.status(200).send(
                    strippedUser
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
        // req.session.user = null;

        /*
        const userSocket = socketManager.getSocketFromUserID(req.user.u_id);
        if (userSocket) {
            // delete user's socket if they logged out
            socketManager.removeUser(req.user, userSocket);
        }
        */
        res.status(200).send({ message: "您已登出！" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};

/*
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
*/