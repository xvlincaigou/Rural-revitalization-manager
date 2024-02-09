const mongoose = require("mongoose");

//define a comment schema for the database
const CommentSchema = new mongoose.Schema({
  creator: {
    _id: String,
    name: String
  },
  activity_id: String,
  send_date: {
    type: Date,
    default: Date.now
  },
  object: String, // links to the _id of a parent story (_id is an autogenerated field by Mongoose).
  level: Number,  // 
  content: String,
});

// compile model from schema
module.exports =  mongoose.model("activity_comment", CommentSchema);
