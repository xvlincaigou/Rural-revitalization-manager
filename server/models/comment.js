const mongoose = require("mongoose");

//define a comment schema for the database
const CommentSchema = new mongoose.Schema({
  creator: {
    _id: String,
    name: String
  },
  send_date: {
    type: Date,
    default: Date.now
  },
  activity_id: String, // links to the _id of a parent story
  member_id: {
    type: String,
    default: 'x'
  },
  rating: {
    type: Number,
    default: 0
  },
  comment: String,
});

// compile model from schema
module.exports = {
  ActivityComment: mongoose.model("activity_comment", CommentSchema),
  MemberComment: mongoose.model("member_comment", CommentSchema),
};
