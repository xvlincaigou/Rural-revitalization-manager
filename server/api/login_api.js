const express = require("express");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();
const auth = require("../controllers/auth.controller");

// POST /api/login
// 请求体形如 { u_id: "xxx", password: "xxx" }
// 用于核验密码，密码正确则发送2FA验证码，等待验证
// 只返回200状态码和{ message: "验证码已发送！" }，不返回用户信息
router.post("/", auth.login);

// 验证码有效期5分钟，过期后需要重新发送验证码，重新发送验证码的冷却时间为1分钟

// POST /api/login/verifyCode
// 请求体形如 { u_id: "xxx", code: "xxx" }
// 用于验证验证码有效性
// 若有效则返回200状态码和用户信息，即user对象
// 若无效则返回401状态码和{ message: "验证码无效！" }
router.post("/verifyCode", auth.verifyCode);

// POST /api/login/requestCode
// 请求体形如 { u_id: "xxx" }
// 用于请求新的验证码
// 若可以发送验证码则返回200状态码和{ message: "验证码已重新发送！" }
// 若冷却时间还没到则返回500状态码和{ message: "验证码发送失败！" }
router.post("/requestCode", auth.requestCode);

module.exports = router;
