const database = require('../database');
const Schema = database.Schema;

const SettingsSchema = new Schema({
    theme: {
        type: String
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true }, );

const Settings = database.model('settings', SettingsSchema);

module.exports = { Settings };