const express = require("express");
const {
  uploadScreenshot,
  getProctoringData,
  getExamProctoringData,
  addViolation,
  endProctoringSession,
} = require("../controllers/proctoringController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * 👩‍🎓 Student routes
 */
// Student uploads screenshots during exam
router.post(
  "/screenshot",
  protect,
  authorizeRoles("student"),
  uploadScreenshot
);

// Student ends their proctoring session
router.post(
  "/end-session",
  protect,
  authorizeRoles("student"),
  endProctoringSession
);

/**
 * 👨‍🏫 Examiner routes
 */
// Examiner fetches proctoring data for a specific student
router.get(
  "/data/:examId/:userId",
  protect,
  authorizeRoles("examiner"),
  getProctoringData
);

// Examiner fetches all proctoring data for an entire exam
router.get(
  "/exam/:examId",
  protect,
  authorizeRoles("examiner"),
  getExamProctoringData
);

// Examiner manually adds a violation
router.post("/violation", protect, authorizeRoles("examiner"), addViolation);

module.exports = router;
