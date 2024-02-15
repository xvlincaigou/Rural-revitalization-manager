const express = require("express");

// import models so we can interact with the database
const Complaint = require("../models/complaint");

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

//回复投诉
//POST /api/complaint/reply
router.post("/reply",auth.verifyToken,async(req,res)=>{
   try{
    const { complaint_id,reply,recipient_id,recipient_name}=req.body;
    const complaint= await Complaint.findById(complaint_id);
    const currentDate = new Date();
    if (!complaint) {
     return res.status(404).json({ message: "未找到投诉" });
    }
    complaint.reply=reply;
    complaint.responsed=1;
    complaint.recipient={
     u_id: recipient_id,
     name: recipient_name,
     timestamp: currentDate
    }
    await complaint.save();
    res.status(200).json({ message: "回复成功" });
    }catch (err) {
    res.status(400).json({ message: err.message });
   }
  });
  
//查看回复
//GET /api/complaint/reply/check
router.get("/reply/check",auth.verifyToken,async(req,res)=>{
   try{
    const uid = req.params.uid;
    const complaints = await Complaint.find({ 'sender.u_id': uid, responsed: 1 });
    if(complaints.length === 0){
     return res.status(404).json({ message: "还没有被回复的投诉" });
    }
    res.status(200).json(complaints);
    }catch (err) {
    res.status(400).json({ message: err.message });
    console.log(uid);
    console.log(err);
    console.log(res);
    console.log(uid);
   }
  });

module.exports = router;
