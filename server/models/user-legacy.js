// 本文件为原项目的user.js，由现user.js替代
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
