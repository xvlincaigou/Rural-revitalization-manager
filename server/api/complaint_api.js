const express = require("express");

// import models so we can interact with the database
const Complaint = require("../models/complaint");
const Activity = require("../models/activity");

// import authentication library
const auth = require("../middlewares/authJwt");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

// POST /api/complaint
router.post("/", auth.verifyToken, async (req, res) => {
  try{
    const {sender, content} = req.body;
    const newComplaint = new Complaint({
      sender: sender,
      recipient: {
        u_id: "",
        name: "",
        timestamp: ""
      },
      content: content,
      reply: "",
      responsed:0
    },{versionKey:false});
    await newComplaint.save();
    delete newComplaint.__v;
    await newComplaint.save();  
    res.status(200).json({message: "Complaint added successfully"});
  }catch(err){
    res.status(404).json({error: "No complaint"});
  }
});

// GET /api/complaint
router.get("/", auth.verifyToken, async (req, res) => {
  // get all complaints that are not responsed and sort by date
  try{
    const not_responsed = await Complaint.find({responsed: 0}).sort({"sender.timestamp": 1});
    res.status(200).json({complaint: not_responsed, message: "Complaints sent"});
  }catch(err){
    res.status(404).json({error: "No complaints"});
  }
});

//管理员回复成员的投诉
router.post("/complaint/reply",auth.verifyToken,async(req,res)=>{
  try{
    const { complaint_id,reply}=req.body;
    const complaint=Complaint.findById(complaint_id);
    if (!complaint) {
      return res.status(404).json({ message: "未找到投诉" });
    }
    complaint.reply=reply;
    complaint.responsed=1;
    await complaint.save();
    }catch (err) {
    res.status(400).json({ message: err.message });
  }
});
  
//查看自己发出的投诉的回复
router.post("/complaint/reply/check",auth.verifyToken,async(req,res)=>{
  try{
    const { complaint_id}=req.body;
    const complaint=Complaint.findById(complaint_id);
    if (!complaint) {
      return res.status(404).json({ message: "未找到投诉" });
    }
    if(complaint.responsed==0){
      return res.status(404).json({ message: "此投诉尚未被管理员回复" });
    }
    const responseData = {
      reply:complaint.reply,
    };
    res.status(200).json(responseData);
    }catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
