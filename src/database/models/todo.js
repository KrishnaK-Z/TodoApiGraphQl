const database = require('../database');
const Schema = database.Schema;

const TodoSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: [
            "open",
            "completed",
            "review"
        ]
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

TodoSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

TodoSchema.set('toJSON', {
    getters: true,
});

TodoSchema.set('toObject', {
    getters: true,
});

const Todo = mongoose.model('Todo', TodoSchema);

module.exports = { Todo };