const express = require("express");
const { register, login, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register new user (student/examiner)
router.post("/register", register);

// Login and set secure HTTP-only cookie
router.post("/login", login);

// Logout (clears cookie)
router.post("/logout", logout);

// Get current user info (protected)
router.get("/me", protect, getMe);

module.exports = router;
