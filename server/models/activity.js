const mongoose = require('mongoose');

// define an activity schema for the database
const ActivitySchema = new mongoose.Schema({
    name: String,
    location: String,
    date: {
        start: Date,
        end: Date,
        sign_up: Date
    },
    capacity: Number,
    candidates: [String],  // Here contains u_id
    members: [String],
    comments: [String],
    supervisors: [String],
    score: {
        type: Number,
        default: 0
    }
});

// compile model from schema
module.exports = mongoose.model("activity", ActivitySchema);