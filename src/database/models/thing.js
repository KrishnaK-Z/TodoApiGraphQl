const database = require('../database');
const Schema = database.Schema;

const ThingSchema = new Schema({
    thing: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    _todoId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

const Thing = mongoose.model('Thing', ThingSchema);

module.exports = { Thing };