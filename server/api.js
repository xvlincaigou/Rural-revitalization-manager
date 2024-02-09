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
const Complaint = require("./models/complaint");
const Activity = require("./models/activity");

// import authentication library
const auth = require("./controllers/auth.controller");

// 导入jwt认证模块
const jwt = require("./middlewares/authJwt")

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

const socketManager = require("./server-socket");
const complaint = require("./models/complaint");

router.get("/activity", async (req, res) => {
  // get all activities and sort by date
  try{
    const activities = await Activity.find().sort({start_time: -1});
    res.send(activities);
    res.status(200).json({message: "Activities sent"});
  }catch(err){
    res.status(404).json({error: "No activities"});
  }
});

router.post("/activity", async (req, res) => {
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

router.post("/activity/subscribe", async (req, res) => {
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

router.post("/activity/unsubscribe", async (req, res) => {
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

router.post("/complaint", async (req, res) => {
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

router.get("/complaint", async (req, res) => {
  // get all complaints that are not responsed and sort by date
  try{
    const not_responsed = await Complaint.find({responsed: 0}).sort({timestamp: 1});
    res.send(not_responsed);
    res.status(200).json({message: "Complaints sent"});
  }catch(err){
    res.status(404).json({error: "No complaints"});
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
    object: req.body.object,
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
