const express = require("express");
const { generateCertificate } = require("../controllers/certificateController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Only authenticated students can generate certificates
router.post(
  "/generate",
  protect,
  authorizeRoles("student"),
  generateCertificate
);

module.exports = router;
