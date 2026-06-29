const mongoose = require('mongoose');

const proctoringDataSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    screenshots: [{
        timestamp: { type: Date, required: true },
        imageUrl: { type: String, required: true },
        faceDetected: { type: Boolean, default: false },
        violation: { type: String, default: null }
    }],
    violations: [{
        type: { type: String, required: true }, // 'no_face', 'multiple_faces', 'suspicious_activity'
        timestamp: { type: Date, required: true },
        description: { type: String, required: true },
        severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
    }],
    faceDetectionStats: {
        totalChecks: { type: Number, default: 0 },
        faceDetectedCount: { type: Number, default: 0 },
        noFaceCount: { type: Number, default: 0 },
        faceDetectionRate: { type: Number, default: 0 }
    },
    examStartTime: { type: Date, required: true },
    examEndTime: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProctoringData', proctoringDataSchema); 