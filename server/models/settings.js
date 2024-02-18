const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    storyPublishingEnabled: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('settings', settingsSchema);