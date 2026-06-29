// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const certificateRoutes = require("./routes/certificate");

dotenv.config();
connectDB().then("Mongodb connected");

const app = express();

app.use(
  cors({
    origin: "https://examify-gold.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve static files for uploaded screenshots
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/exams", require("./routes/exams"));
app.use("/api/results", require("./routes/results"));
app.use("/api/certificate", certificateRoutes);
app.use("/api/proctoring", require("./routes/proctoring"));

const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log(`Server running on port ${PORT}`);
});
