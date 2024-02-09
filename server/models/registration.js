const mongoose = require("mongoose");

//define a registration schema for the database
const RegistSchema = new mongoose.Schema({
    email: String,
    activity_id: String,
});

// compile model from schema
module.exports = mongoose.model("registration", RegistSchema);