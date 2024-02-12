const express = require("express");

// import models so we can interact with the database

const {StoryComment, ActivityComment, MemberComment} = require("../models/comment");
const {User, Admin} = require("../models/user");
const Activity = require("../models/activity");

// import authentication library
const auth = require("../middlewares/authJwt");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.get("/activity", auth.verifyToken, async (req, res) => {
  // get all activities and sort by date
  try{
    const activities = await Activity.find().sort({start_time: -1});
    res.send(activities);
    res.status(200).json({message: "Activities sent"});
  }catch(err){
    res.status(404).json({error: "No activities"});
  }
});

router.post("/activity", auth.verifyToken, async (req, res) => {
  // post a new activity
  try{
    const {name, location, date, capacity, supervisors} = req.body;
    const newActivity = new Activity({
      name: name,
      location: location,
      date: date,
      capacity: capacity,
      supervisors: supervisors
    });

    await newActivity.save();
    res.status(200).json({message: "Activity added successfully"});
  }catch(err){
    res.status(404).json({error: "No activity"});
  }
});

router.post("/activity/subscribe", auth.verifyToken, async (req, res) => {
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

router.post("/activity/unsubscribe", auth.verifyToken, async (req, res) => {
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

router.post("/activity/comment", auth.verifyToken, async (req, res) => {
  try{
    const {creator, send_date, activity_id, rating, comment} = req.body;
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
  }catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.post("/activity/register", auth.verifyToken, async (req, res) => {
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
    activity.candidates.push(email);

    await activity.save();
    res.status(200).json({ message: "成功报名" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/activity/registrants", auth.verifyToken, async (req, res) => {
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

    for(let i=0; i<candidates.size(); i++){
      const user = User.findById(candidates[i]);
      if(user.banned !== 1){
        responseInfo.push(user);
      }
    }

    // Construct response with user's basic information and registrations
    res.status(200).json(responseInfo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
  
router.post("/activity/approve", auth.verifyToken, async (req, res) => {
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

router.post("/activity/update", auth.verifyToken, async (req, res) => {
  try {
    const {new_name, new_location, new_start, 
           new_end, new_sign_up, new_capacity} = req.body;
    // Check if the activity exists
    const activity = await Activity.findById(req.body.activity_id);
    if (!activity) {
      return res.status(404).json({ message: "没有找到活动" });
    }
    activity.name = new_name;
    activity.location = new_location;
    const newdate = {
      start:new_start,
      end:new_end,
      sign_up:new_sign_up
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

router.post("/activity/create", auth.verifyToken, async (req, res) => {
  try {
    const {name, location, date, capacity, supervisors} = req.body;

    // Create a new activity object
    const newActivity = new Activity({//这里待完成！undo，需要确定activity数据库格式
      name: name,
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

router.post("/activity/delete", auth.verifyToken, async (req, res) => {
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

router.post("/activity/admin", auth.verifyToken, async (req, res) => {
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

module.exports = router;
