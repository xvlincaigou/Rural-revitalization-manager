const express = require("express");
const config = require("../config/auth.config");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// import models so we can interact with the database
const User = require("../models/user");

// import models so we can interact with the database
const Activity = require("../models/activity");

// import authentication library
const auth = require("../middlewares/authJwt");

const Settings = require("../models/settings");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

// import models so we can interact with the database
const { StoryComment, ActivityComment, MemberComment } = require("../models/comment");
const activity = require("../models/activity");

// 初始化设置
async function initializeSettings() {
  const existingSettings = await Settings.findOne();

  if (!existingSettings) {
    const defaultSettings = new Settings();
    await defaultSettings.save();
  }
}

initializeSettings().catch(console.error);

// POST /api/user/tags
router.post("/tags", auth.verifyToken, async (req, res) => {
  try {
    const { u_id, tag, visibility, action, role } = req.body;
    let message;
    let tagbag = { tag, visibility };

    // 确认身份
    if (role === 0) {
      return res.status(400).json({message: "You are not allowed to modify tags!"});
    }

    // 找到用户
    const user = await User.findOne({u_id: u_id});
    if (!user) {
      return res.status(404).json({ message: "未找到用户" });
    }

    // 执行添加或删除标签操作
    if (action === "add") {
      user.tags.push(tagbag);
      message = "成功添加标签";
    } else if (action === "remove") {
      const index = user.tags.indexOf(tag);
      if (index !== -1) {
        user.tags.splice(index, 1);
        message = "成功删除标签";
      } else {
        return res.status(404).json({ message: "未找到此标签" });
      }
    } else {
      return res.status(400).json({ message: "非法操作" });
    }

    // 保存更新后的用户信息
    await user.save();
    res.status(200).json({ message: message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/user/tags
router.get("/tags", auth.verifyToken, auth.hasExecutiveManagerPrivileges, async (req, res) => {
  try {
    const { u_id, operator_id, role } = req.query;
    // 找到用户
    const user = await User.findOne({u_id: u_id});
    if (!user) {
      return res.status(404).json({ message: "未找到用户" });
    }
    let tag_list = [];
    const role_num = parseInt(role);
    if (role_num === 2) {
      user.tags.forEach(tagbag => {
        tag_list.push(tagbag.tag);
      });
    } else if (role_num === 1) {
      user.tags.forEach(tagbag => {
        if (tagbag.visibility < 3) {
          tag_list.push(tagbag.tag);
        }
      });
    } else if (role_num === 0) {
      let is_supervisor = 0;
      for (const activity_id of user.activities) {
        activity = await Activity.findById(activity_id);
        if (activity.supervisors.some(supervisor => supervisor.u_id === operator_id)) {
          is_supervisor = 1;
          break;
        }
      }
      if (is_supervisor === 1) {
        user.tags.forEach(tagbag => {
          if (tagbag.visibility < 2) {
            tag_list.push(tagbag.tag);
          }
        });
      } else {
        user.tags.forEach(tagbag => {
          if (tagbag.visibility < 1) {
            tag_list.push(tagbag.tag);
          }
        });
      }
    }
    res.status(200).json({tag_list: tag_list});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/user/ban
router.post("/ban",auth.verifyToken, auth.isSysAdmin, async (req, res) => {
  try{
    const {uid,ban}=req.body;
    const user=await User.findById(uid)
    if (!user) {
      return res.status(404).json({ message: "未找到用户" });
    }
    user.ban=ban;
    await user.save();
    res.status(200).json({ message: "成功更改用户封禁状态" });
  }catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/participate_activities", auth.verifyToken, async (req, res) => {
  try {
    const user = req.query;
    const completeUser = await User.findOne({u_id: user.u_id});
    const aid_list =  completeUser.activities;
    var activity_list = [];
    
    for (const aid of aid_list) {
      var activity = await Activity.findById(aid);
      if (activity) {
        if (activity.members.some(member => member.u_id === user.u_id) || 
        activity.supervisors.some(supervisor => supervisor.u_id === user.u_id)) {
          activity_list.push(activity);
        }
      } else {
        return res.status(404).json({message: "Activity not found."});
      }
    }
    
    res.status(200).json(activity_list);
  } catch(err) {
    res.status(400).json({message: err.message});
  }
});

router.get("/supervise_activities", auth.verifyToken, async (req, res) => {
  try {
    const user = req.query;
    const completeUser = await User.findOne({u_id: user.u_id})
    const aid_list = completeUser.activities;
    var activity_list = [];
    
    for (const aid of aid_list) {
      var activity = await Activity.findById(aid);
      if (activity) {
        if (activity.supervisors.some(supervisor => supervisor.u_id === user.u_id)) {
          activity_list.push(activity);
        }
      } else {
        return res.status(404).json({message: "Activity not found."});
      }
    }
    
    res.status(200).json(activity_list);
  } catch(err) {
    res.status(400).json({message: err.message});
  }
});

// POST api/user/comment
router.post("/comment", auth.verifyToken, async (req, res) => {
  try {
    const {creator, activity_id, member_id, rating, comment} = req.body;
    const member = await User.findOne({u_id: member_id});
    const new_comment = new MemberComment({
      creator: creator,
      activity_id: activity_id,
      member_id: member_id,
      rating: rating,
      comment: comment
    });
    await new_comment.save();
    member.comment_received.push(new_comment._id);
    const current_score = {score: rating, activity_id: activity_id};
    member.previous_scores.push(current_score);
    await member.save();
    res.status(200).json("Comment sent successfully.");
  } catch(err) {
    res.status(400).json({message: err.message});
  }
});

// GET api/user/information
router.get("/information", auth.verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({u_id: req.query.u_id});
    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    var activity_list = [];
    for (const activity_id of user.activities) {
      const activity = await Activity.findById(activity_id);
      if (activity) {
        if (activity.members.some(member => member.u_id === user.u_id) || 
            activity.supervisors.some(supervisor => supervisor.u_id === user.u_id)) {
          activity_list.push(activity);
        }
      } else {
        return res.status(404).json({message: "Activity not found."});
      }
    }

    var average_score = 0;
    for (const remark of user.previous_scores) {
      average_score += remark.score;
    }
    average_score /= user.previous_scores.length;

    const feedback = {
      name: user.name,
      u_id: user.u_id,
      phone_number: user.phone_number,
      average_score: average_score,
      activity_list: activity_list
    };
    res.status(200).json(feedback);
  } catch(err) {
    res.status(400).json({message: err.message});
  }
});

// POST /api/user/manage_admin
router.post("/manage_admin", auth.verifyToken, async (req, res) => {
  try {
    const {u_id, promotion} = req.body;
    const user = await User.findOne({u_id: u_id});
    if (!user) {
      return res.status(404).json({message: "User not found."});
    }
    if (promotion === 1) {
      user.role = 1;
      await user.save();
      return res.status(200).json({message: "User is now excutive administrator."});
    }
    user.role = 0;
    res.status(200).json({message: "User is now common user."});
  } catch (err) {
    res.status(400).json({message: err.message});
  }
});

// POST /api/user/delete
router.post("/delete", auth.verifyToken, async (req, res) => {
  await User.findOneAndDelete({u_id: req.body.u_id}, function (err, user) {
    if (err) {
      return res.status(400).json({message: err.message});
    } else {
      if (!user) {
        return res.status(404).json({message: "User not found."});
      } else {
        res.status(200).json({message: "User deleted."});
      }
    }
  });
});

// POST /api/user/requst-registration-code
// 生成用户注册码-需要系统管理员权限
// 请求体形如：{ count: *需要生成的注册码数量，暂定最大10000个* }
// 返回一个csv文件
// 未知错误时返回400状态码和{ message: *错误信息* }
router.post("/requst-registration-code", auth.verifyToken, auth.isSysAdmin, async (req, res) => {
  try {
    const { count } = req.body;
    const limit = 10000;
    if (isNaN(count)) {
      return res.status(400).json({ message: 'count 必须是一个数字。' });
    }
    if (count > limit) {
      return res.status(400).json({ message: `您请求生成的注册码数量过多，上限为${limit}个，您请求了${count}个。` });
    }
    if (count < 1) {
      return res.status(400).json({ message: `您请求生成的注册码数量过少，下限为1个，您请求了${count}个。` });
    }
    const settings = await Settings.findOne();
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const timestamp = new Date().getTime().toString();
    const outputPath = path.join(tempDir, `generated_registration_codes_${timestamp}.csv`);
    const stream = fs.createWriteStream(outputPath);
    stream.write('注册码\n'); // 写入表头
    for (let i = 0; i < count; i++) {
      let rawCode = "";
      rawCode += timestamp;
      rawCode += i.toString().padStart(6, "0");
      const hmac = crypto.createHmac('sha256', config.secret);
      hmac.update(rawCode);
      const code = hmac.digest('hex');
      // TODO: 将注册码写入数据库
      settings.availableRegistrationCodes.push(code);
      stream.write(`${code}\n`); // 写入一行数据
    }
    stream.end(() => {
      fs.readFile(outputPath, async (err, data) => {
        if (err) {
          console.error('Error reading CSV file:', err);
          res.status(500).send('在读取生成的CSV文件时发生错误。');
        } else {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename="registration_codes.csv"');
          res.send(data);
          await settings.save();
        }
      });
    });
  } catch (err) {
    res.status(400).json({message: err.message});
  }
});

// POST api/user/information
router.post("/information", auth.verifyToken, async (req, res) => {
  try {
    const {u_id, phone_number, id_number, password} = req.body;
    const update_fields = {}
    if (phone_number.trim() !== "") {
      update_fields.phone_number = phone_number;
    }
    if (id_number.trim() !== "") {
      update_fields.id_number = id_number;
    }
    if (password.trim() !== "") {
      update_fields.password = password;
    }
    if (Object.keys(update_fields).length === 0) {
      return res.status(400).json({ message: "Everything is up to date." });
    }
    await User.findOneAndUpdate({u_id: u_id}, {$set: update_fields});
    res.status(200).json({message: "Information updated successfully."});
  } catch(err) {
    res.status(500).json({message: err.message});
  }
});

module.exports = router;
