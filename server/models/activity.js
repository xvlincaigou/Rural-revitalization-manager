const mongoose = require('mongoose');

// define an activity schema for the database
const ActivitySchema = new mongoose.Schema({
    name: String,
    abbreviation: { // 支队简称，对应关系请查表，默认为0表示未设置
        type: Number,
        default: 0,
    },
    location: String,
    team: String,
    date: {
        start: Date,
        end: Date,
        sign_up: Date
    },
    capacity: Number,
    candidates: {
        type: [{u_id: String, name: String}],
        default: [] 
    },  
    members: {
        type: [{u_id: String, name: String}],
        default: [] 
    },  
    comments: [mongoose.Schema.Types.ObjectId],
    supervisors: {
        type: [{u_id: String, name: String}],
        default: [] 
    },  
    score: {
        type: Number,
        default: 0
    },
    intro: String
});

// compile model from schema
module.exports = mongoose.model("activity", ActivitySchema);