const express = require("express");

// import models so we can interact with the database

const { StoryComment, ActivityComment, MemberComment } = require("../models/comment");
const { User, Admin } = require("../models/user");
const Activity = require("../models/activity");

// import authentication library
const auth = require("../middlewares/authJwt");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

// 用于生成证书
const { PDFDocument, degrees, rgb } = require("pdf-lib");
const fs = require("fs");
const fontkit = require('fontkit'); // 导入 fontkit 库
const path = require('path');

// GET /api/activity
router.get("/", auth.verifyToken, async (req, res) => {
   // get all activities and sort by date
   Activity.find({}).sort({ date: -1 })
    .then((activities) => res.send(activities))
    .catch((err) => res.status(404).send(err));
});

// POST /api/activity
router.post("/", auth.verifyToken, async (req, res) => {
  // post a new activity
  try {
    const { name, abbreviation, location, date, capacity, supervisors } = req.body;
    const newActivity = new Activity({
      name: name,
      abbreviation: abbreviation,
      location: location,
      date: date,
      capacity: capacity,
      supervisors: supervisors
    });

    await newActivity.save();
    res.status(200).json({ message: "Activity added successfully" });
  } catch (err) {
    res.status(404).json({ error: "No activity" });
  }
});

// POST /api/activity/subscribe
router.post("/subscribe", auth.verifyToken, async (req, res) => {
  try {
    const { uid, aid } = req.body;
    const activity = await Activity.findOne({ _id: aid });
    const user = await User.findOne({ u_id: uid });
    if (activity) {
      activity.candidates.push(uid);
      await activity.save();
      res.status(200).json({ message: "User added successfully" });
    } else {
      res.status(404).json({ message: "Cannot find the activity" });
    }
    if (user) {
      user.activities.push(aid);
      await user.save();
      res.status(200).json({ message: "Activity recorded successfully" });
    } else {
      res.status(404).json({ message: "Cannot find the user" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/unsubscribe
router.post("/unsubscribe", auth.verifyToken, async (req, res) => {
  try {
    const { uid, aid } = req.body;
    console.log(req.body);
    const activity = await Activity.findOne({ _id: aid });
    const user = await User.findOne({ u_id: uid });
    if (activity) {
      const index = activity.candidates.indexOf(uid);
      if (index !== -1) {
        activity.candidates.splice(index, 1);
        await activity.save();
        res.status(200).json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ message: "User not added" });
      }
    } else {
      res.status(404).json({ message: "Cannot find the activity" });
    }
    if (user) {
      const index = user.activities.indexOf(aid);
      if (index !== -1) {
        user.activities.splice(index, 1);
        await user.save();
        res.status(200).json({ message: "Activity deleted successfully" });
      } else {
        res.status(404).json({ message: "Activity not recorded" });
      }
    } else {
      res.status(404).json({ message: "Cannot find the user" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/comment
router.post("/comment", auth.verifyToken, async (req, res) => {
  try {
    const { creator, send_date, activity_id, rating, comment } = req.body;
    const activity = await Activity.findById(activity_id);
    activity.comments.push(req.body._id);
    const newComment = new ActivityComment({
      creator: creator,
      send_date: send_date,
      activity_id: activity_id,
      rating: rating,
      comment: comment
    });
    // Save the new activity to the database
    await activity.save();
    await newComment.save();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/register
router.post("/register", auth.verifyToken, async (req, res) => {
  try {
    const { email, activity_id, name } = req.body;
    // Check if activity exists and if the registration date has not passed
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有找到活动" });
    }

    const currentDate = new Date();
    if (currentDate > activity.registrationEndDate) {
      return res.status(400).json({ message: "已经超过报名截止日期" });
    }

    const candidate = {u_id: email, name: name};
    // Assuming ActivityRegistration model has fields: email, activity_id
    activity.candidates.push(candidate);

    await activity.save();
    res.status(200).json({ message: "成功报名" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/activity/registrants
router.get("/registrants", auth.verifyToken, async (req, res) => {
  try {
    const { activity_id } = req.query;

    // Assuming you want to find registrants by their email
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有此活动" });
    }
    const candidates = activity.candidates;

    // Find activity registrations associated with the user
    // const telephone = [];
    // const name = [];
    var responseInfo = [];

    for (let i = 0; i < candidates.size(); i++) {
      const user = User.findById(candidates[i]);
      if (user.banned !== 1) {
        responseInfo.push(user);
      }
    }

    // Construct response with user's basic information and registrations
    res.status(200).json(responseInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/approve
router.post("/approve", auth.verifyToken, async (req, res) => {
  try {
    const { u_id, accept, activity_id } = req.body;
    const Activity_id = activity_id;

    // Check if the activity exists
    const activity = await Activity.findById(Activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有找到活动" });
    }

    // Find the user by email
    const user = await User.findOne({ u_id: u_id });
    if (!user) {
      return res.status(404).json({ message: "没有找到用户" });
    }

    if (accept) {
      // Add the user to the participants list of the activity
      activity.members.push(user.u_id);
      await activity.save();
      return res.status(200).json({ message: "同意用户报名活动" });
    } else {
      return res.status(200).json({ message: "拒绝用户报名活动" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/update
router.post("/update", auth.verifyToken, async (req, res) => {
  try {
    const { new_name, new_abbreviation, new_location, new_start,
      new_end, new_sign_up, new_capacity } = req.body;
    // Check if the activity exists
    const activity = await Activity.findById(req.body.activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有找到活动" });
    }
    activity.name = new_name;
    activity.abbreviation = new_abbreviation;
    activity.location = new_location;
    const newdate = {
      start: new_start,
      end: new_end,
      sign_up: new_sign_up
    }
    activity.date = newdate;
    activity.capacity = new_capacity;
    // Save the updated activity
    await activity.save();

    return res.status(200).json({ message: "成功更新活动信息" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/create
router.post("/create", auth.verifyToken, async (req, res) => {
  try {
    const { name, abbreviation, location, date, capacity, supervisors } = req.body;

    // Create a new activity object
    const newActivity = new Activity({//这里待完成！undo，需要确定activity数据库格式
      name: name,
      abbreviation: abbreviation,
      location: location,
      date: date,
      capacity: capacity,
      supervisors: supervisors
    });

    // Save the new activity to the database
    await newActivity.save();
    return res.status(200).json({ message: "成功创建活动" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/delete
router.post("/delete", auth.verifyToken, async (req, res) => {
  try {
    const activity_id = req.body.activity_id;

    // Check if the activity exists
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有找到活动" });
    }

    // Delete the activity
    await Activity.findByIdAndDelete(activity_id);
    return res.status(200).json({ message: "成功删除活动" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/admin
router.post("/admin", auth.verifyToken, async (req, res) => {
  try {
    const { activity_id, admin_email, action } = req.body;

    // 查找活动
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ message: "未找到活动" });
    }

    // 根据操作执行添加或删除活动管理员的操作
    if (action === "add") {
      // 添加活动管理员
      activity.supervisors.push(admin_email);
    } else if (action === "remove") {
      // 删除活动管理员
      const index = activity.supervisors.indexOf(admin_email);
      if (index !== -1) {
        activity.supervisors.splice(index, 1);
      } else {
        return res.status(404).json({ message: "未找到管理员" });
      }
    } else {
      return res.status(400).json({ message: "非法操作" });
    }

    // 保存更新后的活动信息
    await activity.save();
    res.status(200).json({ message: "成功更新管理员信息" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/certificate
// 请求中应包含：uid（用户邮箱，user中u_id）, aid（activity中_id）
const generatingUsers = {};
router.post("/certificate", auth.verifyToken, async (req, res) => {
  try {
    // 读取请求信息
    const { uid, aid } = req.body;
    console.log("uid: ", uid);
    console.log("aid:" , aid);
    console.log(req.body);
    const user = await User.findOne({ u_id: uid });
    const activity = await Activity.findOne({ _id: aid });
    if (!user) {
      return res.status(400).json({ message: "没有找到用户！" })
    }
    if (!activity) {
      return res.status(400).json({ message: "没有找到活动！" })
    }

    // 检查用户是否在生成列表中
    if (generatingUsers[uid]) {
      // 如果用户已经在生成列表中，则返回错误
      return res.status(400).send("已经有一个证书正在生成中。");
    }

    // 将用户添加到生成列表中
    generatingUsers[uid] = true;

    // 读取证书模板
    const templatePath = path.join(__dirname, '../assets/certificate_template.pdf');
    const templateBytes = fs.readFileSync(templatePath);

    // 创建一个新的 PDF 文档
    const pdfDoc = await PDFDocument.load(templateBytes);

    // 注册 fontkit 实例
    pdfDoc.registerFontkit(fontkit);

    // 获取第一个页面
    const page = pdfDoc.getPages()[0];

    // 设置字体
    const fontPath = path.join(__dirname, '../assets/certificate_template.pdf');
    const fontBytes = fs.readFileSync(fontPath);
    const kaiTiFont = await pdfDoc.embedFont(fontBytes);
    const fontSize = 13;

    // 计算文本宽度
    const lineHeight = kaiTiFont.heightAtSize(fontSize) * 2; // 增加行高，根据需要调整倍数

    // 姓名部分
    const name = user.name;

    // 姓名坐标（这里假设nameX和nameY是文字右对齐的起点位置）
    const nameX = 180;
    const nameY = 366;

    // 右对齐
    const nameTextHeight = kaiTiFont.heightAtSize(fontSize); // 文本高度
    const nameEndY = nameY - nameTextHeight; // 计算旋转后文字下端的Y坐标

    // 90度旋转后，x和y的含义交换了
    page.drawText(name, {
      x: nameEndY,
      y: nameX - kaiTiFont.widthOfTextAtSize(name, fontSize),
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });

    // 日期部分
    const startDate = activity.date.start;
    const startYear = startDate.getFullYear().toString();
    const startMonth = (startDate.getMonth() + 1).toString(); // 月份从 0 开始，需要加 1
    const startDay = startDate.getDate().toString();

    const endDate = activity.date.end;
    const endYear = endDate.getFullYear().toString();
    const endMonth = (endDate.getMonth() + 1).toString(); // 月份从 0 开始，需要加 1
    const endDay = endDate.getDate().toString();

    // 起始坐标
    const startYearX = 215;
    const startYearY = 414;
    const startMonthX = 272; // +67
    const startMonthY = 414;
    const startDayX = 310; // +38
    const startDayY = 414;
    const endYearX = 383;
    const endYearY = 414;
    const endMonthX = 442;
    const endMonthY = 414;
    const endDayX = 478;
    const endDayY = 414;

    // 计算文本水平居中位置
    const startYearWidth = kaiTiFont.widthOfTextAtSize(startYear, fontSize);
    const startMonthWidth = kaiTiFont.widthOfTextAtSize(startMonth, fontSize);
    const startDayWidth = kaiTiFont.widthOfTextAtSize(startDay, fontSize);
    const startYearCenterX = startYearX - startYearWidth / 2;
    const startYearCenterY = startYearY - lineHeight / 2;
    const startMonthCenterX = startMonthX - startMonthWidth / 2;
    const startMonthCenterY = startMonthY - lineHeight / 2;
    const startDayCenterX = startDayX - startDayWidth / 2;
    const startDayCenterY = startDayY - lineHeight / 2;
    const endYearWidth = kaiTiFont.widthOfTextAtSize(endYear, fontSize);
    const endMonthWidth = kaiTiFont.widthOfTextAtSize(endMonth, fontSize);
    const endDayWidth = kaiTiFont.widthOfTextAtSize(endDay, fontSize);
    const endYearCenterX = endYearX - endYearWidth / 2;
    const endYearCenterY = endYearY - lineHeight / 2;
    const endMonthCenterX = endMonthX - endMonthWidth / 2;
    const endMonthCenterY = endMonthY - lineHeight / 2;
    const endDayCenterX = endDayX - endDayWidth / 2;
    const endDayCenterY = endDayY - lineHeight / 2;

    // 绘制文本
    page.drawText(startYear, {
      x: startYearCenterY,
      y: startYearCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });
    page.drawText(startMonth, {
      x: startMonthCenterY,
      y: startMonthCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });
    page.drawText(startDay, {
      x: startDayCenterY,
      y: startDayCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });
    page.drawText(endYear, {
      x: endYearCenterY,
      y: endYearCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });
    page.drawText(endMonth, {
      x: endMonthCenterY,
      y: endMonthCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });
    page.drawText(endDay, {
      x: endDayCenterY,
      y: endDayCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });

    // 地点部分
    const location = activity.location;

    // 地点坐标
    const locationX = 250;
    const locationY = 438;

    // 计算文本水平居中位置
    const locationWidth = kaiTiFont.widthOfTextAtSize(location, fontSize);
    const locationCenterX = locationX - locationWidth / 2;
    const locationCenterY = locationY - lineHeight / 2;

    // 绘制文本
    page.drawText(location, {
      x: locationCenterY,
      y: locationCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });

    // 支队名部分
    const teamName = activity.name;

    // 支队名坐标
    const teamNameX = 268;
    const teamNameY = 462;

    // 计算文本水平居中位置
    const teamNameWidth = kaiTiFont.widthOfTextAtSize(teamName, fontSize);
    const teamNameCenterX = teamNameX - teamNameWidth / 2;
    const teamNameCenterY = teamNameY - lineHeight / 2;

    // 绘制文本
    page.drawText(teamName, {
      x: teamNameCenterY,
      y: teamNameCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });

    // 编号部分
    var sn = "";
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    sn += currentYear;

    // 判断是寒假还是暑假
    const startMonthInt = parseInt(startMonth);
    if (startMonthInt >= 11 || startMonthInt <= 4) {
      sn += "03";
    } else {
      sn += "09";
    }

    // TODO: 支队编号
    sn += activity.abbreviation.toString();

    // TODO: 队员序列号
    var userIndex = (activity.candidates.indexOf(user.u_id) + 1).toString();
    userIndex = userIndex.padStart(2, "0"); // 活动人数应小于99人
    sn += userIndex;

    // 编号坐标
    const snX = 176;
    const snY = 667;

    // 绘制文本
    page.drawText(sn, {
      x: snY,
      y: snX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });

    // 证书生成日期部分
    // 获取日期
    const currentMonth = (now.getMonth() + 1).toString(); // 月份从 0 开始，需要加 1
    const currentDay = now.getDate().toString();

    // 起始坐标
    const currentYearX = 383;
    const currentYearY = 687;
    const currentMonthX = 433;
    const currentMonthY = 687;
    const currentDayX = 469;
    const currentDayY = 687;
    const currentYearWidth = kaiTiFont.widthOfTextAtSize(currentYear, fontSize);
    const currentMonthWidth = kaiTiFont.widthOfTextAtSize(currentMonth, fontSize);
    const currentDayWidth = kaiTiFont.widthOfTextAtSize(currentDay, fontSize);
    const currentYearCenterX = currentYearX - currentYearWidth / 2;
    const currentYearCenterY = currentYearY - lineHeight / 2;
    const currentMonthCenterX = currentMonthX - currentMonthWidth / 2;
    const currentMonthCenterY = currentMonthY - lineHeight / 2;
    const currentDayCenterX = currentDayX - currentDayWidth / 2;
    const currentDayCenterY = currentDayY - lineHeight / 2;

    // 绘制文本
    page.drawText(currentYear, {
      x: currentYearCenterY,
      y: currentYearCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });
    page.drawText(currentMonth, {
      x: currentMonthCenterY,
      y: currentMonthCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });
    page.drawText(currentDay, {
      x: currentDayCenterY,
      y: currentDayCenterX,
      size: fontSize,
      font: kaiTiFont,
      color: rgb(0, 0, 0),
      rotate: degrees(90),
    });

    // 生成 PDF 字节
    const pdfBytes = await pdfDoc.save();

    // 将生成的 PDF 字节写入文件
    const tempString = user._id.toString();
    const outputPath = `../temp/generated_certificate_${tempString}.pdf`;
    fs.writeFileSync(outputPath, pdfBytes);

    // 生成完成后，从列表中删除该用户
    delete generatingUsers[uid];

    // 发送生成的 PDF 文件给前端
    res.download(outputPath, 'certificate.pdf', (err) => {
      if (err) {
        console.error('Error sending PDF file:', err);
        res.status(500).send('在发送证书PDF文件时发生错误。');
      } else {
        console.log('PDF file sent successfully!');
        res.status(200).send('已经发生证书PDF文件！');
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
