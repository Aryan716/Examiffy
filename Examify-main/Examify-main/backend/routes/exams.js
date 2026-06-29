const express = require("express");
const {
  createExam,
  getExams,
  getExamById,
  submitExam,
  getResults,
  getAllExams,
} = require("../controllers/examController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * Examiner routes
 */
// Create a new exam (Examiner only)
router.post("/", protect, authorizeRoles("examiner"), createExam);

// Get exams - examiners see their created exams, students see available exams
router.get("/", protect, getExams);

// View all exams in the system (Examiner only)
router.get("/all", protect, authorizeRoles("examiner"), getAllExams);

/**
 * Student routes
 */
// Get a specific exam by ID (Student only)
router.get("/:id", protect, authorizeRoles("student"), getExamById);

// Submit exam answers (Student only)
router.post("/submit", protect, authorizeRoles("student"), submitExam);

// Get student's results (Student only)
router.get("/results", protect, authorizeRoles("student"), getResults);

module.exports = router;
