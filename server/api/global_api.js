const express = require("express");

// import models so we can interact with the database
const Story = require("../models/story");
const User = require("../models/user");
const Complaint = require("../models/complaint");
const Activity = require("../models/activity");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

// GET /api/global/appdata
router.get("/appdata", async (req, res) => {
  try {
    const activityCount = await Activity.countDocuments();
    const postCount = await Story.countDocuments();
    const userCount = await User.countDocuments();
    const complaintCount = await Complaint.countDocuments();
    const complaintReplyCount = await Complaint.countDocuments({ responsed: 1 });

    const returnData = {
      activityCount,
      postCount,
      userCount,
      complaintCount,
      complaintReplyCount,
    };

    res.status(200).json(returnData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/global/session
router.get("/session", async (req, res) => {
  try {
    const user = req.session.user;
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(200).json({});
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
