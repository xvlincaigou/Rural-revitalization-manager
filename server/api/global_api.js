const express = require("express");

// import models so we can interact with the database
const Story = require("../models/story");
const {User, Admin} = require("../models/user");
const Complaint = require("../models/complaint");
const Activity = require("../models/activity");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.get("/appdata", async (req, res) => {
  try{
    var count = 0;
    Complaint.countDocuments({ responsed: 1 }, (err, result) => {
      if (err) {
        console.error('Error:', err);
      } else {
        count = result;
      }
    });
    const returnData = {
      activityCount: Activity.size(),
      postCount: Story.size(),
      userCount: User.size(),
      complaint: Complaint.size(),
      complaintReply: count,
    };
    res.status(200).json(returnData);
  }catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;