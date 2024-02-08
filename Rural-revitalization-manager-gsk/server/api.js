/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const Story = require("./models/story");
const Comment = require("./models/comment");
const User = require("./models/user");
const Message = require("./models/message");
const Activity = require("./models/activity");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

const socketManager = require("./server-socket");
const message = require("./models/message");

router.get("/activities", async (req, res) => {
  // get all activities and sort by date
  try {
    const activities = await Activity.find().sort({date: -1});
    res.send(activities)
  } catch(err) {
    res.status(404);
    res.send({ error: "No activities" });
  }
})

router.post("/activity", async (req, res) => {
  // post a new activity
  try{
    const newActivity = new Activity({
      activity_id: req.body.activity_id,
      activity_name: req.body.activity_name,
      activity_date: req.body.activity_date,
    });

    await newActivity.save().then((activity) => res.send(activity));
  }catch(err){
    res.status(404);
    res.send({ error: "No activity" });
  }
})

router.post("/subscribe", async (req, res) => {
  try{
    const {uid, actid} = req.body;
    const activity = await Activity.findOne({activity_id: actid});
    const user = await User.findOne({google_id: uid});
    if(activity){
      activity.participants.push(uid);
      await activity.save();
      res.status(200).json({message: "User added successfully"});
    }else{
      res.status(404).json({message: "Cannot find the activity"});
    }
    if(user){
      user.activities.push(actid);
      await user.save();
      res.status(200).json({message: "Activity recorded successfully"});
    }else{
      res.status(404).json({message: "Cannot find the user"});
    }
  }catch(err){
    res.status(400).json({message: err.message});
  }
})

router.post("/unsubscribe", async (req, res) => {
  try {
    const {uid, actid} = req.body;
    const activity = await Activity.findOne({activity_id: actid});
    const user = await User.findOne({google_id: uid});
    if(activity){
      const index = activity.participants.indexOf(uid);
      if(index !== -1){
        activity.participants.splice(index, 1);
        await activity.save();
        res.status(200).json({message: "User deleted successfully"});
      }else{
        res.status(404).json({message: "User not added"});
      }
    }else{
      res.status(404).json({message: "Cannot find the activity"});
    }
    if(user){
      const index = user.activities.indexOf(actid);
      if(index !== -1){
        user.activities.splice(index, 1);
        await user.save();
        res.status(200).json({message: "Activity deleted successfully"});
      }else{
        res.status(404).json({message: "Activity not recorded"});
      }
    }else{
      res.status(404).json({message: "Cannot find the user"});
    }
    await user.save();
  }catch(err){
    res.status(400).json({message: err.message});
  }
})

router.get("/stories", (req, res) => {
  // empty selector means get all documents
  Story.find({}).then((stories) => res.send(stories));
});

router.post("/story", auth.ensureLoggedIn, (req, res) => {
  const newStory = new Story({
    creator_id: req.user._id,
    creator_name: req.user.name,
    content: req.body.content,
  });

  newStory.save().then((story) => res.send(story));
});

router.get("/comment", (req, res) => {
  Comment.find({ parent: req.query.parent }).then((comments) => {
    res.send(comments);
  });
});

router.post("/comment", auth.ensureLoggedIn, (req, res) => {
  const newComment = new Comment({
    creator_id: req.user._id,
    creator_name: req.user.name,
    parent: req.body.parent,
    content: req.body.content,
  });

  newComment.save().then((comment) => res.send(comment));
});

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.get("/user", (req, res) => {
  User.findById(req.query.userid).then((user) => {
    res.send(user);
  });
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

router.get("/chat", (req, res) => {
  let query;
  if (req.query.recipient_id === "ALL_CHAT") {
    // get any message sent by anybody to ALL_CHAT
    query = { "recipient._id": "ALL_CHAT" };
  } else {
    // get messages that are from me->you OR you->me
    query = {
      $or: [
        { "sender._id": req.user._id, "recipient._id": req.query.recipient_id },
        { "sender._id": req.query.recipient_id, "recipient._id": req.user._id },
      ],
    };
  }

  Message.find(query).then((messages) => res.send(messages));
});

router.post("/message", auth.ensureLoggedIn, (req, res) => {
  console.log(`Received a chat message from ${req.user.name}: ${req.body.content}`);

  // insert this message into the database
  const message = new Message({
    recipient: req.body.recipient,
    sender: {
      _id: req.user._id,
      name: req.user.name,
    },
    content: req.body.content,
  });
  message.save();

  if (req.body.recipient._id == "ALL_CHAT") {
    socketManager.getIo().emit("message", message);
  } else {
    socketManager.getSocketFromUserID(req.user._id).emit("message", message);
    if (req.user._id !== req.body.recipient._id) {
      socketManager.getSocketFromUserID(req.body.recipient._id).emit("message", message);
    }
  }
});

router.get("/activeUsers", (req, res) => {
  res.send({ activeUsers: socketManager.getAllConnectedUsers() });
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

const ActivityRating = require("./models/rating");

router.post("/activity/rating", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { email, rating, review } = req.body;

    // Assuming ActivityRating model has fields: email, rating, review, activity_id
    const activityRating = new ActivityRating({
      email: email,
      rating: rating,
      review: review,
      activity_id: req.body.activity_id // Assuming activity_id is provided in the request body
    });

    await activityRating.save();
    res.status(200).json({ message: "成功获得对活动的评价并存入数据库" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const ParticipantRating = require("./models/participantRating");

router.post("/participant/rating", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { email, rating, review } = req.body;

    // Assuming ParticipantRating model has fields: email, rating, review, participant_id
    const participantRating = new ParticipantRating({
      email: email,
      rating: rating,
      review: review,
      participant_id: req.body.participant_id // Assuming participant_id is provided in the request body
    });

    await participantRating.save();
    res.status(200).json({ message: "成功获得对参与者的评价并存入数据库" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const ActivityRegistration = require("./models/activityRegistration");

router.post("/activity/register", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { email, activity_id } = req.body;

    // Check if activity exists and if the registration date has not passed
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有找到活动" });
    }

    const currentDate = new Date();
    if (currentDate > activity.registrationEndDate) {
      return res.status(400).json({ message: "已经超过报名截止日期" });
    }

    // Assuming ActivityRegistration model has fields: email, activity_id
    const activityRegistration = new ActivityRegistration({
      email: email,
      activity_id: activity_id
    });

    await activityRegistration.save();
    res.status(200).json({ message: "成功报名" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/activity/registrants", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { email } = req.query;

    // Assuming you want to find registrants by their email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "没有找到此用户" });
    }

    // Find activity registrations associated with the user
    const registrations = await ActivityRegistration.find({ email: email });

    // Construct response with user's basic information and registrations
    const responseData = {
      user: {
        name: user.name,
        email: user.email,
        // Add more user basic information fields as needed
      },
      registrations: registrations
    };

    res.status(200).json(responseData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/activity/approve", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { email, accept } = req.body;
    const activity_id = req.body.activity_id;

    // Check if the activity exists
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有找到活动" });
    }

    // Find the user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "没有找到用户" });
    }

    if (accept) {
      // Add the user to the participants list of the activity
      activity.participants.push(user._id);
      await activity.save();
      return res.status(200).json({ message: "同意用户报名活动" });
    } else {
      return res.status(200).json({ message: "拒绝用户报名活动" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/activity/update", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { activity_id, updatedInfo } = req.body;//这里待完成！undo，需要按格式修改updateinfo

    // Check if the activity exists
    const activity = await Activity.findById(activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有找到活动" });
    }

    // Update activity information based on the provided updatedInfo object
    Object.assign(activity, updatedInfo);

    // Save the updated activity
    await activity.save();

    return res.status(200).json({ message: "成功更新活动信息" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/activity/create", auth.ensureLoggedIn, async (req, res) => {
  try {
    const {  } = req.body;

    // Create a new activity object
    const newActivity = new Activity({//这里待完成！undo，需要确定activity数据库格式
      //todo
    });

    // Save the new activity to the database
    await newActivity.save();

    return res.status(200).json({ message: "成功创建活动" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/activity/delete", auth.ensureLoggedIn, async (req, res) => {
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

//
router.post("/user/tags", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { userId, tag, visibility, action } = req.body;
    let message;
    let tagbag={tag,visibility};
    // 找到用户
    const user = await User.findById(userId);
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

// 设置标签的可见性
router.post("/tag/visibility", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { userId,tag, visibility } = req.body;

    // 找到用户
    const user = await User.findOne(userId);
    if (!user) {
      return res.status(404).json({ message: "未找到用户" });
    }

    // 查找标签在用户模型中的索引
    const tagIndex = user.tags.findIndex(entry => entry[0] === tag);

    // 如果标签不存在于用户模型中，则添加新的标签及可见性信息
    if (tagIndex === -1) {
      user.tags.push({tag, visibility});
    } else {
      // 更新标签的可见性
      user.tags[tagIndex].visibility = visibility;
    }

    // 保存更新后的用户信息
    await user.save();

    res.status(200).json({ message: "成功更新标签可见性" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/activity/admin", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { activityId, adminEmail, action } = req.body;

    // 查找活动
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "未找到活动" });
    }

    // 根据操作执行添加或删除活动管理员的操作
    if (action === "add") {
      // 添加活动管理员
      activity.supervisors.push(adminEmail);
    } else if (action === "remove") {
      // 删除活动管理员
      const index = activity.supervisors.indexOf(adminEmail);
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

const Admin = require("./models/admin");

router.post("/admin", auth.ensureLoggedIn, async (req, res) => {
  try {
    const { adminEmail, action } = req.body;

    // 查找常务管理员
    const adminUser = await Admin.findOne({ email: adminEmail });
    if (!adminUser) {
      return res.status(404).json({ message: "未找到常务管理员" });
    }

    // 根据操作执行添加或删除常务管理员的操作
    if (action === "add") {
      // 添加常务管理员角色
      adminUser.isAdmin = true;
      await adminUser.save();
      res.status(200).json({ message: "成功添加常务管理员" });
    } else if (action === "remove") {
      // 删除常务管理员角色
      adminUser.isAdmin = false;
      await adminUser.save();
      res.status(200).json({ message: "成功删除常务管理员" });
    } else {
      res.status(400).json({ message: "非法操作" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//undo：启用或禁用用户等：需要在数据库方面进行改动支持，在user里添加一个是否封禁的属性。

module.exports = router;
