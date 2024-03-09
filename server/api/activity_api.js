const express = require("express");

// import models so we can interact with the database

const { StoryComment, ActivityComment, MemberComment } = require("../models/comment");
const User = require("../models/user");
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

// GET /api/activity/activities-page-count
router.get("/activities-page-count", (req, res) => {
  let pageSize = 10;
  // 获取帖子页数
  Activity.countDocuments({}, (err, count) => {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    }
    res.status(200).json({ pageNum: Math.ceil(count / pageSize) });
  });
});

// GET /api/activity
router.get("/", auth.verifyToken, async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let pageSize = 10;
  // get all activities and sort by date
  Activity.find({})
    .sort({ date: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
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
    if (activity && user) {
      if (user.activities.some(a_id => a_id.toString() === aid.toString())) {
        return res.status(200).json({message: "Subscribed already."});
      }
      activity.candidates.push({u_id: uid, name: user.name});
      await activity.save();
      user.activities.push(aid);
      await user.save();
      res.status(200).json({ message: "报名成功！" });
    } else {
      res.status(404).json({ message: "没有找到活动或用户" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/activity/unsubscribe
router.post("/unsubscribe", auth.verifyToken, async (req, res) => {
  try {
    const { uid, aid } = req.body;
    const activity = await Activity.findOne({ _id: aid });
    const user = await User.findOne({ u_id: uid });
    if (activity && user) {
      const index = activity.candidates.findIndex((candidate) => candidate.u_id === uid);
      const _index = user.activities.indexOf(aid);
      if (index !== -1 && _index !== -1) {
        if (activity.members.some(member => member.u_id === uid)) {
          return res.status(200).json({message: "Already accepted, cannot resign."});
        }
        activity.candidates.splice(index, 1);
        user.activities.splice(index, 1);
        await activity.save();
        await user.save();
        res.status(200).json({ message: "取消报名成功！" });
      } else {
        res.status(404).json({ message: "没有找到活动或用户" });
      }
    } else {
      res.status(404).json({ message: "没有找到活动或用户" });
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
    const newComment = new ActivityComment({
      creator: creator,
      send_date: send_date,
      activity_id: activity_id,
      rating: rating,
      comment: comment
    });
    // Save the new activity to the database
    await newComment.save();
    activity.comments.push(newComment._id);
    let new_score = 0;
    for(const comment_id of activity.comments) {
      const one_comment = await ActivityComment.findById(comment_id);
      new_score += one_comment.rating;
    }
    activity.score = new_score / activity.comments.length;
    await activity.save();
    res.status(200).json({ message: "Comment sent successfully." });
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
  
    const candidate = {u_id: email, name: name};
    // Assuming ActivityRegistration model has fields: email, activity_id
    if(activity.capacity==activity.members.length){
     res.status(200).json({message:"成员数目超过限制"});
    }
    else{
     activity.members.push(candidate);
     await activity.save();
     res.status(200).json({ message: "接收" });
    }
   } catch (err) {
    res.status(400).json({ message: err.message });
   }
  });

// POST /api/activity/update
router.post("/update", auth.verifyToken, async (req, res) => {
  try {
    // Check if the activity exists
    const activity = await Activity.findById(req.body.activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有找到活动" });
    }
    activity.name = req.body.name;
    activity.location = req.body.location;
    activity.date = req.body.date;
    activity.intro = req.body.intro;
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
    const { name, location, team, date, capacity, intro } = req.body;
    if (!name) {
      return res.status(404).json({message: "Invalid input."});
    }
    // Create a new activity object
    const newActivity = new Activity({
      name: name,
      location: location,
      team: team,
      date: date,
      capacity: capacity,
      intro: intro
    });

    // Save the new activity to the database
    await newActivity.save();
    return res.status(200).json({ message: "成功创建活动" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/activity/search_byname
router.get("/search_byname", auth.verifyToken, async (req, res) => {
  try {
    const activity = await Activity.findOne({name: req.query.activity_name});
    if (!activity) {
      return res.status(404).json({message: "Activity not found"});
    }
    res.status(200).json({activity_id: activity._id});
  } catch(err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/activity/search_activity
router.get("/search_activity", auth.verifyToken, async (req, res) => {
     try {
       const activity = await Activity.findOne({name: req.query.activity_name});
       if (!activity) {
          return res.status(404).json({message: "Activity not found"});
       }
       res.status(200).json(activity);
     } catch(err) {
       res.status(400).json({ message: err.message });
     }
  });

// POST /api/activity/admin
router.post("/admin", auth.verifyToken, auth.isSysAdmin, async (req, res) => {
  try {
    const { activity_id, admin_ids } = req.body;
    // 查找活动
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ message: "未找到活动" });
    }
    for (const admin_info of activity.supervisors) {
      const admin = await User.findOne({u_id: admin_info.u_id});
      const index = admin.activities.indexOf(activity_id);
      if (index !== -1) {
        admin.activities.splice(index, 1);
      }
      await admin.save();
    }
    activity.supervisors = [];
    for (const admin_id of admin_ids) {
      const admin = await User.findOne({u_id: admin_id});
      const admin_name = admin.name;
      activity.supervisors.push({
        u_id: admin_id,
        name: admin_name
      });
      admin.activities.push(activity_id);
      await admin.save();
    }
    // 保存更新后的活动信息
    await activity.save();
    res.status(200).json({ message: "成功更新管理员信息" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/activity/fetch_comment
router.get("/fetch_comment", auth.verifyToken, auth.isSysAdmin, async (req, res) => {
  try {
    const activity = await Activity.findById(req.query.activity_id);
    if (!activity) {
      return res.status(404).json({message: "Activity not found."});
    }
    let comment_list = [];
    for (const comment_id of activity.comments) {
      const comment = await ActivityComment.findById(comment_id);
      if (comment) {
        comment_list.push(comment);
      }
    }
    res.status(200).json(comment_list);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/activity/member_comment
router.get("/member_comment", auth.verifyToken, auth.isSysAdmin, async (req, res) => {
  try {
    const comments = await MemberComment.find({activity_id: req.query.activity_id});
    if (comments.length === 0) {
      return res.status(404).json({message: "No comments from members."});
    }
    let comment_list = [];
    for (const comment of comments) {
      const object = await User.findOne({u_id: comment.member_id});
      if (object) {
        const name = object.name;
        const comment_with_name = {
          content: comment,
          to_whom: name
        };
        comment_list.push(comment_with_name);
      } 
    }
    res.status(200).json(comment_list);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

function teamNameToId(name) {
  switch (name) {
    case "福建浦城":
      return 1;
    case "福建三明":
      return 2;
    case "福建永定":
      return 3;
    case "福建福鼎":
      return 4;
    case "福建宁德":
      return 5;
    case "福建福州":
      return 6;
    case "福建集美":
      return 7;
    case "浙江岱山":
      return 8;
    case "浙江淳安":
      return 9;
    case "浙江椒江":
      return 10;
    case "浙江绍兴":
      return 11;
    case "江西龙南":
      return 12;
    case "江西婺源":
      return 13;
    case "江苏高淳":
      return 14;
    case "江苏阜宁":
      return 15;
    case "江苏苏州":
      return 16;
    case "安徽南陵":
      return 17;
    case "安徽霍山":
      return 18;
    case "安徽涡阳":
      return 19;
    case "安徽滁州":
      return 20;
    case "安徽合肥":
      return 21;
    case "安徽黄山":
      return 22;
    case "山东文登":
      return 23;
    case "山东济宁":
      return 24;
    case "山东新泰":
      return 25;
    case "山东莱芜":
      return 26;
    case "山东阳谷":
      return 27;
    case "山东青岛（平度）":
      return 28;
    case "山东青岛（胶州）":
      return 29;
    case "河南三门峡":
      return 30;
    case "河南鸡公山":
      return 31;
    case "河南新蔡":
      return 32;
    case "河南辉县":
      return 33;
    case "河南兰考":
      return 34;
    case "湖北赤壁":
      return 35;
    case "湖北五峰":
      return 36;
    case "湖北宜昌":
      return 37;
    case "湖南大通湖":
      return 38;
    case "湖南麻阳":
      return 39;
    case "湖南慈利":
      return 40;
    case "湖南溆浦":
      return 41;
    case "湖南湘乡":
      return 42;
    case "湖南湘阴":
      return 43;
    case "北京密云":
      return 44;
    case "内蒙古达拉特":
      return 45;
    case "天津宝坻":
      return 46;
    case "山西和顺":
      return 47;
    case "山西大同":
      return 48;
    case "山西临汾":
      return 49;
    case "山西阳泉":
      return 50;
    case "河北信都":
      return 51;
    case "河北青龙":
      return 52;
    case "河北承德":
      return 53;
    case "河北雄安":
      return 54;
    case "河北唐山":
      return 55;
    case "贵州铜仁":
      return 56;
    case "贵州清镇":
      return 57;
    case "贵州榕江":
      return 58;
    case "贵州道真":
      return 59;
    case "云南南涧":
      return 60;
    case "云南腾冲":
      return 61;
    case "四川荣县":
      return 62;
    case "四川理县":
      return 63;
    case "四川古蔺":
      return 64;
    case "四川西充":
      return 65;
    case "四川德阳":
      return 66;
    case "四川眉山":
      return 67;
    case "西藏墨脱":
      return 68;
    case "重庆荣昌":
      return 69;
    case "重庆綦江":
      return 70;
    case "重庆酉阳":
      return 71;
    case "甘肃临潭":
      return 72;
    case "甘肃瓜州":
      return 73;
    case "甘肃临夏":
      return 74;
    case "甘肃渭源":
      return 75;
    case "陕西王益":
      return 76;
    case "陕西清涧":
      return 77;
    case "陕西蒲城":
      return 78;
    case "陕西西咸":
      return 79;
    case "宁夏原州":
      return 80;
    case "宁夏银川":
      return 81;
    case "宁夏惠农":
      return 82;
    case "新疆哈巴河":
      return 83;
    case "青海海西":
      return 84;
    case "青海湟中":
      return 85;
    case "广东从化":
      return 86;
    case "广东连南":
      return 87;
    case "广西扶绥":
      return 88;
    case "广西兴宾":
      return 89;
    case "广西河池":
      return 90;
    case "广西三江":
      return 91;
    case "海南澄迈":
      return 92;
    case "黑龙江甘南":
      return 93;
    case "黑龙江方正":
      return 94;
    case "黑龙江牡丹江":
      return 95;
    case "辽宁鞍山":
      return 96;
    case "辽宁沈阳":
      return 97;
    case "辽宁锦州":
      return 98;
    case "辽宁营口":
      return 99;
    case "吉林敦化":
      return 100;
    default:
      return 0;
  }
}

// POST /api/activity/certificate
// 请求中应包含：uid（用户邮箱，user中u_id）, aid（activity中_id）
const generatingUsers = {};
router.post("/certificate", auth.verifyToken, async (req, res) => {
  try {
    // 读取请求信息
    const { uid, aid } = req.body;
    // DEBUG
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
      return res.status(400).send("已经有一个正在生成的证书。");
    }

    // 将用户添加到生成列表中
    generatingUsers[uid] = true;

    // 读取证书模板
    const assetsDir = path.join(__dirname, '..', 'assets');
    const templatePath = path.join(assetsDir, 'certificate_template.pdf');
    const templateBytes = fs.readFileSync(templatePath);

    // 创建一个新的 PDF 文档
    const pdfDoc = await PDFDocument.load(templateBytes);

    // 注册 fontkit 实例
    pdfDoc.registerFontkit(fontkit);

    // 获取第一个页面
    const page = pdfDoc.getPages()[0];

    // 设置字体
    const fontPath = path.join(assetsDir, "SIMKAI.TTF");
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

    // TODO: 支队编号：如何获取？
    let id = teamNameToId(activity.team).toString();
    id = id.padStart(2, "0");
    sn += id;

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
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const tempString = user._id.toString();
    const outputPath = path.join(tempDir, `generated_certificate_${tempString}.pdf`);
    fs.writeFileSync(outputPath, pdfBytes);

    // 生成完成后，从列表中删除该用户
    delete generatingUsers[uid];

    // 发送生成的 PDF 文件给前端
    fs.readFile(outputPath, (err, data) => {
      if (err) {
        console.error('Error reading PDF file:', err);
        res.status(500).send('在读取证书PDF文件时发生错误。');
      } else {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
        res.send(data);
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
