const mongoose = require("mongoose");

//define a comment schema for the database
const RatingSchema = new mongoose.Schema({
    email:String,
    rating:String,
    review:String,
    activity_id:String,
});

// compile model from schema
module.exports = mongoose.model("comment", RatingSchema);