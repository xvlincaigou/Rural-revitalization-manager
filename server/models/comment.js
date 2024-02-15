const mongoose = require("mongoose");

//define a comment schema for the database
const CommentSchema = new mongoose.Schema({
  creator: {
    u_id: String,
    name: String
  },
  send_date: {
    type: Date,
    default: Date.now
  },
  story_id: mongoose.Schema.Types.ObjectId,
  activity_id: mongoose.Schema.Types.ObjectId, // links to the _id of a parent story
  member_id: String,
  rating: {
    type: Number,
    default: 0
  },
  comment: String,
});

// compile model from schema
module.exports = {
  StoryComment: mongoose.model("story_comments", CommentSchema),
  ActivityComment: mongoose.model("activity_comments", CommentSchema),
  MemberComment: mongoose.model("member_comments", CommentSchema)
};
