const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  google_id: String,
  name: String,
  activities: [String]
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
