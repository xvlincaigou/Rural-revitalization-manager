const express = require("express");

// import models so we can interact with the database
const Story = require("./models/story");
const {StoryComment, ActivityComment, MemberComment} = require("./models/comment");
const {User, Admin} = require("./models/user");
const Activity = require("./models/activity");

// import authentication library
const auth = require("./middlewares/authJwt");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.get("/stories", (req, res) => {
  // empty selector means get all documents
  Story.find({}).then((stories) => res.send(stories));
});

router.post("/story", auth.verifyToken, (req, res) => {
  const {creator_id, creator_name, title, content} = req.body;
  const newStory = new Story({
    creator_id: creator_id,
    creator_name: creator_name,
    title: title,
    content: content,
  });

  newStory.save().then((story) => res.send(story));
});

router.post("/story/comment", auth.verifyToken, async (req, res) => {
  try{
    const {creator, send_date, story_id, comment} = req.body;
    const story = await Story.findById(story_id);
    story.comments.push(req.body._id);
    const newComment = new StoryComment({
      creator: creator,
      send_date: send_date,
      story_id: story_id,
      comment: comment
    });
    // Save the new activity to the database
    await story.save();
    await newComment.save();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;