const Exam = require('../models/Exam');
const Result = require('../models/Result');
const ProctoringData = require('../models/ProctoringData');
const mongoose = require('mongoose');

exports.createExam = async (req, res) => {
    const exam = new Exam({ ...req.body, createdBy: req.user.id });
    try {
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getExams = async (req, res) => {
    try {
        
        if (req.user.role === 'examiner') {
            const exams = await Exam.find({ createdBy: req.user.id });
            return res.json(exams);
        } else {
          
            const completedExams = await Result.find({ user: req.user.id })
                .select('exam')
                .lean();
                
            const completedExamIds = completedExams.map(result => result.exam);
            
           
            const availableExams = await Exam.find({
                _id: { $nin: completedExamIds }
            });
            
            return res.json(availableExams);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        
        if (req.user.role === 'student') {
            const alreadyTaken = await Result.findOne({
                user: req.user.id,
                exam: req.params.id
            });
            
            if (alreadyTaken) {
                return res.status(403).json({ 
                    message: 'You have already completed this exam',
                    result: alreadyTaken
                });
            }
        }
        
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.submitExam = async (req, res) => {
    try {
        const { examId, answers, autoSubmitted, tabSwitches, duration, timeExceeded, proctoringData } = req.body;
        
        // Check if user has already submitted this exam
        const existingResult = await Result.findOne({
            user: req.user.id,
            exam: examId
        });
        
        if (existingResult) {
            return res.status(400).json({ 
                message: 'You have already submitted this exam',
                result: existingResult
            });
        }
        
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        // Check if time limit was exceeded
        const timeLimitInSeconds = exam.timeLimit * 60;
        const timeExceededFlag = timeExceeded || (duration && duration > timeLimitInSeconds);
        
        let score = 0;
        exam.questions.forEach((question, index) => {
            if (question.answer === answers[index]) {
                score++;
            }
        });
        
        const passed = score >= (exam.questions.length / 2); 
        const result = new Result({ 
            user: req.user.id, 
            exam: examId, 
            score, 
            passed,
            autoSubmitted: autoSubmitted || timeExceededFlag,
            tabSwitches: tabSwitches || 0,
            duration: duration || 0,
            timeExceeded: timeExceededFlag,
            completedAt: new Date()
        });
        
        await result.save();
        
        // Handle proctoring data if provided
        if (proctoringData && proctoringData.screenshots && proctoringData.screenshots.length > 0) {
            try {
                // Find existing proctoring data or create new one
                let existingProctoringData = await ProctoringData.findOne({
                    examId: examId,
                    userId: req.user.id
                });
                
                if (!existingProctoringData) {
                    existingProctoringData = new ProctoringData({
                        examId: examId,
                        userId: req.user.id,
                        examStartTime: new Date(Date.now() - (duration * 1000)), // Estimate start time
                        examEndTime: new Date(),
                        screenshots: [],
                        violations: [],
                        faceDetectionStats: {
                            totalChecks: 0,
                            faceDetectedCount: 0,
                            noFaceCount: 0,
                            faceDetectionRate: 0
                        }
                    });
                } else {
                    existingProctoringData.examEndTime = new Date();
                }
                
                // Add screenshots from frontend
                if (proctoringData.screenshots) {
                    existingProctoringData.screenshots.push(...proctoringData.screenshots.map(screenshot => ({
                        timestamp: new Date(screenshot.timestamp),
                        imageUrl: screenshot.imageUrl || 'frontend-captured',
                        faceDetected: screenshot.faceDetected || false
                    })));
                }
                
                // Add violations from frontend
                if (proctoringData.violations) {
                    existingProctoringData.violations.push(...proctoringData.violations.map(violation => ({
                        type: violation.type,
                        timestamp: new Date(violation.timestamp),
                        description: violation.description,
                        severity: violation.severity || 'low'
                    })));
                }
                
                // Update face detection stats
                if (proctoringData.faceDetectionCount !== undefined) {
                    existingProctoringData.faceDetectionStats.faceDetectedCount = proctoringData.faceDetectionCount;
                }
                if (proctoringData.noFaceCount !== undefined) {
                    existingProctoringData.faceDetectionStats.noFaceCount = proctoringData.noFaceCount;
                }
                
                const totalChecks = existingProctoringData.faceDetectionStats.faceDetectedCount + 
                                  existingProctoringData.faceDetectionStats.noFaceCount;
                existingProctoringData.faceDetectionStats.totalChecks = totalChecks;
                
                if (totalChecks > 0) {
                    existingProctoringData.faceDetectionStats.faceDetectionRate = 
                        (existingProctoringData.faceDetectionStats.faceDetectedCount / totalChecks) * 100;
                }
                
                await existingProctoringData.save();
                console.log('Proctoring data saved successfully');
            } catch (proctoringError) {
                console.error('Error saving proctoring data:', proctoringError);
                // Don't fail the exam submission if proctoring data fails to save
            }
        }
        
        res.json({ score, passed, autoSubmitted: autoSubmitted || timeExceededFlag, timeExceeded: timeExceededFlag });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getResults = async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.id })
            .populate('exam')
            .sort({ completedAt: -1 }); 
            
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getAllExams = async (req, res) => {
    try {
        if (req.user.role !== 'examiner') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const exams = await Exam.find({});
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};