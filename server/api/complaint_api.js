const express = require("express");

// import models so we can interact with the database
const Complaint = require("./models/complaint");
const Activity = require("./models/activity");

// import authentication library
const auth = require("./middlewares/authJwt");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.post("/complaint", auth.verifyToken, async (req, res) => {
  try{
    const {sender, content} = req.body;
    const newComplaint = new Complaint({
      sender: sender,
      content: content
    });

    await newComplaint.save();
    res.status(200).json({message: "Complaint added successfully"});
  }catch(err){
    res.status(404).json({error: "No complaint"});
  }
});

router.get("/complaint", auth.verifyToken, async (req, res) => {
  // get all complaints that are not responsed and sort by date
  try{
    const not_responsed = await Complaint.find({responsed: 0}).sort({"sender.timestamp": 1});
    res.send(not_responsed);
    res.status(200).json({message: "Complaints sent"});
  }catch(err){
    res.status(404).json({error: "No complaints"});
  }
});

module.exports = router;