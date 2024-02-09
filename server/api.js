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
const {ActivityComment, MemberComment} = require("./models/comment");
const User = require("./models/user");
const Complaint = require("./models/complaint");
const Activity = require("./models/activity");
const ActivityRegistration = require("./models/registration");

// import authentication library
const auth = require("./controllers/auth.controller");

// 导入jwt认证模块
const jwt = require("./middlewares/authJwt")

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

const socketManager = require("./server-socket");
const complaint = require("./models/complaint");

router.get("/activity", auth.ensureLoggedIn, async (req, res) => {
  // get all activities and sort by date
  try{
    const activities = await Activity.find().sort({start_time: -1});
    res.send(activities);
    res.status(200).json({message: "Activities sent"});
  }catch(err){
    res.status(404).json({error: "No activities"});
  }
});

router.post("/activity", auth.ensureLoggedIn, async (req, res) => {
  // post a new activity
  try{
    const {name, location, date, capacity, candidates,
           members, comments, supervisors} = req.body;
    const newActivity = new Activity({
      name: name,
      location: location,
      date: date,
      capacity: capacity,
      candidates: candidates,
      members: members,
      comments: comments,
      supervisors: supervisors
    });

    await newActivity.save();
    res.status(200).json({message: "Activity added successfully"});
  }catch(err){
    res.status(404).json({error: "No activity"});
  }
});

router.post("/activity/subscribe", auth.ensureLoggedIn, async (req, res) => {
  try{
    const {uid, aid} = req.body;
    const activity = await Activity.findOne({_id: aid});
    const user = await User.findOne({u_id: uid});
    if(activity){
      activity.candidates.push(uid);
      await activity.save();
      res.status(200).json({message: "User added successfully"});
    }else{
      res.status(404).json({message: "Cannot find the activity"});
    }
    if(user){
      user.activities.push(aid);
      await user.save();
      res.status(200).json({message: "Activity recorded successfully"});
    }else{
      res.status(404).json({message: "Cannot find the user"});
    }
  }catch(err){
    res.status(400).json({message: err.message});
  }
});

router.post("/activity/unsubscribe", auth.ensureLoggedIn, async (req, res) => {
  try{
    const {uid, aid} = req.body;
    const activity = await Activity.findOne({_id: aid});
    const user = await User.findOne({u_id: uid});
    if(activity){
      const index = activity.candidates.indexOf(uid);
      if(index !== -1){
        activity.candidates.splice(index, 1);
        await activity.save();
        res.status(200).json({message: "User deleted successfully"});
      }else{
        res.status(404).json({message: "User not added"});
      }
    }else{
      res.status(404).json({message: "Cannot find the activity"});
    }
    if(user){
      const index = user.activities.indexOf(aid);
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
  }catch(err){
    res.status(400).json({message: err.message});
  }
});

router.post("/complaint", auth.ensureLoggedIn, async (req, res) => {
  try{
    const {sender, timestamp, content} = req.body;
    const newComplaint = new Complaint({
      sender: sender,
      timestamp: timestamp,
      content: content
    });

    await newComplaint.save();
    res.status(200).json({message: "Complaint added successfully"});
  }catch(err){
    res.status(404).json({error: "No complaint"});
  }
});

router.get("/complaint", auth.ensureLoggedIn, async (req, res) => {
  // get all complaints that are not responsed and sort by date
  try{
    const not_responsed = await Complaint.find({responsed: 0}).sort({timestamp: 1});
    res.send(not_responsed);
    res.status(200).json({message: "Complaints sent"});
  }catch(err){
    res.status(404).json({error: "No complaints"});
  }
});

router.post("/activity/comment", auth.ensureLoggedIn, async (req, res) => {
  try {
    const {creator, send_date, rating, comment} = req.body;

    // Assuming ActivityRating model has fields: email, rating, review, activity_id
    const activityComment = new ActivityComment({
      creator: creator,
      send_date: send_date,
      activity_id: req.body.activity_id,  // Assuming activity_id is provided in the request body
      rating: rating,
      comment: comment
    });

    await activityComment.save();
    res.status(200).json({ message: "成功获得对活动的评价并存入数据库" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/member/comment", auth.ensureLoggedIn, async (req, res) => {
  try {
    const {creator, send_date, rating, comment} = req.body;

    // Assuming ActivityRating model has fields: email, rating, review, activity_id
    const activityComment = new ActivityComment({
      creator: creator,
      send_date: send_date,
      activity_id: req.body.activity_id,  // Assuming activity_id is provided in the request body
      member_id: req.body.member_id,
      rating: rating,
      comment: comment
    });

    await activityComment.save();
    res.status(200).json({ message: "成功获得对成员的评价并存入数据库" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

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
    const { u_id } = req.query;

    // Assuming you want to find registrants by their email
    const user = await User.findOne({ u_id: u_id });
    if (!user) {
      return res.status(404).json({ message: "没有找到此用户" });
    }

    // Find activity registrations associated with the user
    const registrations = await ActivityRegistration.find({ u_id: u_id });

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
    const { u_id, accept } = req.body;
    const activity_id = req.body.activity_id;

    // Check if the activity exists
    const activity = await Activity.findById(activity_id);
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


router.get("/stories", (req, res) => {
  // empty selector means get all documents
  Story.find({}).then((stories) => res.send(stories));
});

router.post("/story", jwt.verifyToken, (req, res) => {
  const newStory = new Story({
    creator_id: req.user._id,
    creator_name: req.user.name,
    content: req.body.content,
  });

  newStory.save().then((story) => res.send(story));
});

router.get("/comment", (req, res) => {
  Comment.find({ parent: req.query.object }).then((comments) => {
    res.send(comments);
  });
});

router.post("/comment", jwt.verifyToken, (req, res) => {
  const newComment = new Comment({
    creator_id: req.user._id,
    creator_name: req.user.name,
    object_id: req.body.object_id,
    content: req.body.content,
  });

  newComment.save().then((comment) => res.send(comment));
});

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.post("/register", auth.register);

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

router.post("/message", jwt.verifyToken, (req, res) => {
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

module.exports = router;
