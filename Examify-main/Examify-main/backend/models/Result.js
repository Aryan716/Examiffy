const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam', 
        required: true
    },
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    autoSubmitted: { type: Boolean, default: false },
    tabSwitches: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // Duration in seconds
    timeExceeded: { type: Boolean, default: false },
    completedAt: { type: Date, default: Date.now }
});

// Add unique index to prevent duplicate results for same user and exam
resultSchema.index({ user: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);