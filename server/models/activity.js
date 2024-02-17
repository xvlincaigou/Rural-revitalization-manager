const mongoose = require('mongoose');

// define an activity schema for the database
const ActivitySchema = new mongoose.Schema({
    name: String,
    abbreviation: { // 支队简称，对应关系请查表，默认为0表示未设置
        type: Number,
        default: 0,
    },
    location: String,
    date: {
        start: Date,
        end: Date,
        sign_up: Date
    },
    capacity: Number,
    candidates: [String],  // 内容为报名用户的u_id
    members: [String],
    comments: [mongoose.Schema.Types.ObjectId],
    supervisors: [String],
    score: {
        type: Number,
        default: 0
    },
    intro: String
});

// compile model from schema
module.exports = mongoose.model("activity", ActivitySchema);