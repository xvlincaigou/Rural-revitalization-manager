const mongoose = require("mongoose");

//define a story schema for the database
const StorySchema = new mongoose.Schema({
  creator_id: String,
  creator_name: String,
  title: String,
  content: String,
  comments: [mongoose.Schema.Types.ObjectId]
});

// compile model from schema
module.exports = mongoose.model("story", StorySchema);
