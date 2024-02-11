const mongoose = require("mongoose");

// 基础需求：姓名、邮箱、电话、身份证号码、密码、唯一（可考虑对应基于身份证号码的某种单向加密，要确保不容易被识破）的一次性注册码（考虑哈希？）
// 用户角色有：普通用户、活动管理员、常务管理员、系统管理员
// 登陆安全保护：
const UserSchema = new mongoose.Schema({
    name: String, // 姓名
    u_id: String, // 电子邮箱
    phone_number: String, // 手机号
    id_number: String, // 身份证号-暂定
    password: String, // 密码
    role: { // 用户角色
        type: Number,
        default: 0  // 默认情况下，用户被认为是普通用户
        /*
        角色代号与用户角色对应关系：
        0 <-> regularUser      <-> 普通用户
        1 <-> executiveManager <-> 常务管理员
        2 <-> sysAdmin         <-> 系统管理员
        */
    },
    activities: [mongoose.Schema.Types.ObjectId], // contains activity _id
    previous_scores: [{
        score: Number,
        activity_id: mongoose.Schema.Types.ObjectId
    }],  
    comment_received: [mongoose.Schema.Types.ObjectId], // contains comment _id
    tags: [{
        tag: String,
        visibility: Number
    }],
    /*
    用户保护功能：有待讨论
    isAccountFrozen: {
        type: Boolean,
        default: false
    }
    */
});
// 注册码应在用户进行注册时核验

// compile model from schema
module.exports = {
    User: mongoose.model("user", UserSchema),
    Admin: mongoose.model("admin", UserSchema)
};
