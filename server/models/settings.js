const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    storyPostingEnabled: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('settings', settingsSchema);