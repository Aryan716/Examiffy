const express = require("express");
const { getResults } = require("../controllers/examController");
const { generateCertificate } = require("../controllers/certificateController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorizeRoles("student"), getResults);

router.get(
  "/certificate/:resultId",
  protect,
  authorizeRoles("student"),
  generateCertificate
);

module.exports = router;
