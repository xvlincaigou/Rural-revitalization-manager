const mongoose = require("mongoose");

//define a message schema for the database
const ComplaintSchema = new mongoose.Schema({
  sender: {
    u_id: String,  // email
    name: String,
    timestamp: Date
  },
  recipient: {
    u_id: String,
    name: String,
    timestamp: Date
  },
  // timestamp: {type: Date, default: Date.now},
  content: String,
  reply: String,
  responsed: {type: Number, default: 0}
  /*
    投诉信息状态：
    0 <-> not responsed <-> 未回复的投诉
    1 <-> responsed     <-> 已回复的投诉
  */
});

// compile model from schema
module.exports = mongoose.model("complaint", ComplaintSchema);
