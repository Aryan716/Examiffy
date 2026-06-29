const ProctoringData = require('../models/ProctoringData');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Always use absolute path
        const uploadDir = path.resolve(__dirname, '../uploads/screenshots');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('Created upload directory:', uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'screenshot-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

exports.uploadScreenshot = async (req, res) => {
    try {
        upload.single('screenshot')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No screenshot file provided' });
            }

            const { examId, timestamp, faceDetected } = req.body;
            const userId = req.user.id; // Get userId from authenticated user
            
            // Find or create proctoring data
            let proctoringData = await ProctoringData.findOne({
                examId: examId,
                userId: userId
            });

            if (!proctoringData) {
                proctoringData = new ProctoringData({
                    examId: examId,
                    userId: userId,
                    examStartTime: new Date(),
                    screenshots: [],
                    violations: [],
                    faceDetectionStats: {
                        totalChecks: 0,
                        faceDetectedCount: 0,
                        noFaceCount: 0,
                        faceDetectionRate: 0
                    }
                });
            }

            // Add screenshot
            proctoringData.screenshots.push({
                timestamp: new Date(timestamp),
                imageUrl: `/uploads/screenshots/${req.file.filename}`,
                faceDetected: faceDetected === 'true'
            });

            // Update face detection stats
            proctoringData.faceDetectionStats.totalChecks++;
            if (faceDetected === 'true') {
                proctoringData.faceDetectionStats.faceDetectedCount++;
            } else {
                proctoringData.faceDetectionStats.noFaceCount++;
            }
            
            proctoringData.faceDetectionStats.faceDetectionRate = 
                (proctoringData.faceDetectionStats.faceDetectedCount / proctoringData.faceDetectionStats.totalChecks) * 100;

            // Check for violations
            if (proctoringData.faceDetectionStats.noFaceCount > 10) {
                proctoringData.violations.push({
                    type: 'no_face',
                    timestamp: new Date(),
                    description: 'No face detected for extended period',
                    severity: 'medium'
                });
            }

            await proctoringData.save();

            res.json({ 
                message: 'Screenshot uploaded successfully',
                proctoringData: proctoringData
            });
        });
    } catch (error) {
        console.error('Error uploading screenshot:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProctoringData = async (req, res) => {
    try {
        const { examId, userId } = req.params;
        
        const proctoringData = await ProctoringData.findOne({
            examId: examId,
            userId: userId
        }).populate('examId').populate('userId');

        if (!proctoringData) {
            return res.status(404).json({ message: 'Proctoring data not found' });
        }

        res.json(proctoringData);
    } catch (error) {
        console.error('Error fetching proctoring data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getExamProctoringData = async (req, res) => {
    try {
        const { examId } = req.params;
        
        // Only examiners can view proctoring data
        if (req.user.role !== 'examiner') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const proctoringData = await ProctoringData.find({
            examId: examId
        }).populate('userId', 'username');

        // Return empty array if no data found instead of 404
        res.json(proctoringData || []);
    } catch (error) {
        console.error('Error fetching exam proctoring data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addViolation = async (req, res) => {
    try {
        const { examId, userId, type, description, severity } = req.body;
        
        let proctoringData = await ProctoringData.findOne({
            examId: examId,
            userId: userId
        });

        if (!proctoringData) {
            return res.status(404).json({ message: 'Proctoring data not found' });
        }

        proctoringData.violations.push({
            type: type,
            timestamp: new Date(),
            description: description,
            severity: severity || 'low'
        });

        await proctoringData.save();

        res.json({ 
            message: 'Violation added successfully',
            violation: proctoringData.violations[proctoringData.violations.length - 1]
        });
    } catch (error) {
        console.error('Error adding violation:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.endProctoringSession = async (req, res) => {
    try {
        const { examId } = req.body;
        const userId = req.user.id; // Get userId from authenticated user
        
        const proctoringData = await ProctoringData.findOne({
            examId: examId,
            userId: userId
        });

        if (!proctoringData) {
            return res.status(404).json({ message: 'Proctoring data not found' });
        }

        proctoringData.examEndTime = new Date();
        await proctoringData.save();

        res.json({ 
            message: 'Proctoring session ended successfully',
            proctoringData: proctoringData
        });
    } catch (error) {
        console.error('Error ending proctoring session:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 