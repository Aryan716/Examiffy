# Examify

Examify is a next-generation online examination platform built with a modern tech stack. It features bank-grade security, AI-powered proctoring, face detection, tab-switch prevention, and comprehensive analytics for both students and examiners.

> **Note**: The source code for this project is located in the `Examify-main/Examify-main/` directory.

## Features

### 🎓 For Students
- **Modern Dashboard**: View available exams and track past performance.
- **Secure Exam Environment**: Anti-cheat mechanisms including copy-paste prevention and tab-switch monitoring.
- **Real-time Timer**: Countdown timer for time-limited exams with auto-submission.
- **Instant Results**: View your score immediately after submission.
- **Downloadable Certificates**: Get a PDF certificate for passed exams.

### 👨‍🏫 For Examiners
- **Exam Creation**: Intuitive interface to create multiple-choice questions with time limits.
- **Live Proctoring Dashboard**: Monitor students in real-time.
- **Security Alerts**: Get notified of severe violations (tab switches, face missing).
- **Automated Snapshots**: Periodic webcam snapshots stored for review.
- **Comprehensive Analytics**: View aggregated stats on violations and student performance.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Framer Motion, Lucide React, Axios, React Router 7.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Proctoring**: WebRTC/MediaDevices API for camera, basic canvas-based face detection algorithms.
- **Authentication**: JWT based authentication.

## UI/UX Redesign (Platform 2.0)

The application has recently undergone a complete visual overhaul featuring:
- Premium dark mode first design
- Glassmorphism UI components (`backdrop-blur`)
- Fluid micro-animations with Framer Motion
- Gradient typography and hover states
- Fully responsive layout for Desktop, Tablet, and Mobile

*Note: The business logic, API endpoints, and database schema remained 100% untouched during this visual upgrade.*

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Examify-main/Examify-main/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your MongoDB URI and JWT Secret.
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Examify-main/Examify-main/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## Security & Privacy Notice
This platform requests camera permissions strictly for live proctoring. Images are captured periodically during the active exam session and sent to the server for examiner review. No video/audio is recorded or stored permanently beyond the exam context.

## License
MIT License
