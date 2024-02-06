const mongoose = require('mongoose');

// define an activity schema for the database
const ActivitySchema = new mongoose.Schema({
    activity_id: String,
    activity_name: String,
    activity_date: Date,
    participants: [String]
});

// compile model from schema
module.exports = mongoose.model("activity", ActivitySchema);
