const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  storyPostingEnabled: {
    type: Boolean,
    default: true,
  },
  availableRegistrationCodes: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("settings", settingsSchema);
