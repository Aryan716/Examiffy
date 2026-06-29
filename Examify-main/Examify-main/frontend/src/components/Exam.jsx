import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../contexts/AuthContext";

const Exam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const role = user?.role;
  const [tabSwitches, setTabSwitches] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  // Camera permission gate (students must allow camera before exam begins)
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(null);
  const [requestingCamera, setRequestingCamera] = useState(false);
  const pendingStreamRef = useRef(null); // holds stream acquired at permission gate
  const [faceDetected, setFaceDetected] = useState(false);
  const [proctoringData, setProctoringData] = useState({
    screenshots: [],
    violations: [],
    faceDetectionCount: 0,
    noFaceCount: 0,
  });

  const examStartTime = useRef(Date.now());
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const proctoringInterval = useRef(null);
  const screenshotInterval = useRef(null);

  const toastIds = useRef({
    copyPaste: null,
    rightClick: null,
    tabSwitch: null,
    keyboardShortcut: null,
    timeWarning: null,
    cameraWarning: null,
    faceWarning: null,
  });
  const isAutoSubmitting = useRef(false);
  const countdownInterval = useRef(null);
  const timeCountdownInterval = useRef(null);
  const modalDiv = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false); // Use ref to track submission status in intervals

  // Function to show a toast with ID to prevent duplicates
  const showToast = (type, message, options = {}) => {
    // Skip if already auto-submitting
    if (isAutoSubmitting.current) return;

    // If a toast with this ID already exists, dismiss it first
    if (toastIds.current[type]) {
      toast.dismiss(toastIds.current[type]);
    }

    // Show the new toast and store its ID
    toastIds.current[type] = toast.error(message, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  // Step 1: Request camera permission at the gate (before exam loads)
  const requestCameraPermission = async () => {
    setRequestingCamera(true);
    setCameraPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      // Store the stream so startCameraProctoring can reuse it
      pendingStreamRef.current = stream;
      setCameraPermissionGranted(true);
    } catch (error) {
      console.error("Camera permission denied:", error);
      setCameraPermissionError(
        "Camera access is required to take this exam. Please click \"Allow\" when your browser asks for camera permission, then try again."
      );
    } finally {
      setRequestingCamera(false);
    }
  };

  // Step 2: Attach the already-granted stream to the video element
  const startCameraProctoring = async () => {
    try {
      // Reuse the stream from the permission gate if available
      const stream = pendingStreamRef.current
        ? pendingStreamRef.current
        : await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user",
            },
          });

      pendingStreamRef.current = null; // clear reference
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);

        // Start face detection
        startFaceDetection();

        // Start periodic screenshots
        startScreenshotCapture();

        console.log("Camera proctoring started");
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      showToast(
        "cameraWarning",
        "Camera access denied. Proctoring will be limited.",
        { autoClose: 5000 }
      );
    }
  };

  // Function to stop camera proctoring
  const stopCameraProctoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);

    if (proctoringInterval.current) {
      clearInterval(proctoringInterval.current);
      proctoringInterval.current = null;
    }
    if (screenshotInterval.current) {
      clearInterval(screenshotInterval.current);
      screenshotInterval.current = null;
    }
    
    // Mark as submitted to prevent any further camera operations
    submittedRef.current = true;
  };

  // Function to start face detection
  const startFaceDetection = () => {
    proctoringInterval.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && submittedRef.current === false) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Check if video is ready and has valid dimensions
        if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
          return; // Video not ready yet, skip this iteration
        }
        
        const ctx = canvas.getContext("2d");
        
        // Validate dimensions before setting canvas size
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          try {
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Validate canvas dimensions before getting image data
            if (canvas.width > 0 && canvas.height > 0) {
              // Simple face detection (basic implementation)
              // In a real implementation, you'd use a proper face detection library
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              
              if (imageData && imageData.data && imageData.data.length > 0) {
                const hasFace = detectFaceBasic(imageData);

                setFaceDetected(hasFace);

                if (hasFace) {
                  setProctoringData((prev) => ({
                    ...prev,
                    faceDetectionCount: prev.faceDetectionCount + 1,
                  }));
                } else {
                  setProctoringData((prev) => {
                    const newNoFaceCount = prev.noFaceCount + 1;
                    // Warning if no face detected for too long
                    if (newNoFaceCount > 10) {
                      showToast(
                        "faceWarning",
                        "No face detected. Please stay in front of the camera.",
                        { autoClose: 3000 }
                      );
                    }
                    return {
                      ...prev,
                      noFaceCount: newNoFaceCount,
                    };
                  });
                }
              }
            }
          } catch (error) {
            // Silently handle errors (video might not be ready or canvas issues)
            console.warn("Face detection error:", error);
          }
        }
      }
    }, 1000); // Check every second
  };

  // Basic face detection (simplified - in production use a proper library)
  const detectFaceBasic = (imageData) => {
    // This is a simplified implementation
    // In production, use libraries like face-api.js or similar
    const data = imageData.data;
    let skinPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Simple skin color detection
      if (
        r > 95 &&
        g > 40 &&
        b > 20 &&
        Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
        Math.abs(r - g) > 15 &&
        r > g &&
        r > b
      ) {
        skinPixels++;
      }
    }

    const totalPixels = data.length / 4;
    const skinPercentage = skinPixels / totalPixels;

    return skinPercentage > 0.1; // If more than 10% of pixels are skin-colored
  };

  // Function to capture screenshots
  const startScreenshotCapture = () => {
    screenshotInterval.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && submittedRef.current === false) {
        const video = videoRef.current;
        
        // Check if video is ready and has valid dimensions
        if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
          return; // Video not ready yet, skip this iteration
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Validate dimensions before setting canvas size
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            canvas.toBlob(
              (blob) => {
                if (blob && submittedRef.current === false) {
                  const screenshot = {
                    timestamp: new Date().toISOString(),
                    image: blob,
                    faceDetected: faceDetected,
                    examId: id,
                  };

                  setProctoringData((prev) => ({
                    ...prev,
                    screenshots: [...prev.screenshots, screenshot],
                  }));

                  console.log(
                    "Attempting to send screenshot to backend:",
                    screenshot
                  );
                  // Send screenshot to backend
                  sendScreenshotToBackend(screenshot);
                }
              },
              "image/jpeg",
              0.8
            );
          } catch (error) {
            // Silently handle errors (video might not be ready or canvas issues)
            console.warn("Screenshot capture error:", error);
          }
        }
      }
    }, 30000); // Capture every 30 seconds
  };

  // Function to send screenshot to backend
  const sendScreenshotToBackend = async (screenshot) => {
    try {
      const formData = new FormData();
      // Attach the blob with a filename so multer can save it
      formData.append(
        "screenshot",
        screenshot.image,
        `screenshot-${Date.now()}.jpg`
      );
      formData.append("timestamp", screenshot.timestamp);
      formData.append("faceDetected", screenshot.faceDetected);
      formData.append("examId", screenshot.examId);

      console.log("POST /proctoring/screenshot", formData);
      await api.post("/proctoring/screenshot", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Error sending screenshot:", error);
    }
  };

  // Function to handle tab visibility change
  const handleVisibilityChange = () => {
    // Skip if already auto-submitting
    if (isAutoSubmitting.current) return;

    if (document.hidden) {
      // User is leaving the tab
      setTabSwitches((prev) => {
        const newCount = prev + 1;

        // Show toast notification with unique ID
        showToast(
          "tabSwitch",
          `Warning: You've switched tabs ${newCount}/3 times. After 3 switches, your exam will be submitted automatically.`,
          {
            autoClose: 3000,
          }
        );

        // If reached limit, auto-submit
        if (newCount >= 3) {
          // Set auto-submitting flag to prevent more toasts
          isAutoSubmitting.current = true;

          // Show a modal-like message before auto-submitting
          modalDiv.current = document.createElement("div");
          modalDiv.current.className =
            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
          modalDiv.current.innerHTML = `
                        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md text-center">
                            <h3 class="text-xl font-bold text-red-600 mb-4">Exam Auto-Submitted</h3>
                            <p class="mb-4">Your exam has been automatically submitted due to switching tabs 3 times.</p>
                            <p class="text-sm text-gray-500">You will be redirected to the home page in <span id="countdown">10</span> seconds.</p>
                        </div>
                    `;
          document.body.appendChild(modalDiv.current);

          // Start countdown
          let countdown = 10;
          const countdownElement = document.getElementById("countdown");

          // Clear any existing interval
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
          }

          countdownInterval.current = setInterval(() => {
            countdown--;
            if (countdownElement) {
              countdownElement.textContent = countdown;
            }

            if (countdown <= 0) {
              clearInterval(countdownInterval.current);
              // Force a re-render to ensure navigation happens
              setTimeout(() => {
                handleAutoSubmit("tab switches");
              }, 100);
            }
          }, 1000);
        }

        return newCount;
      });
    }
  };

  // Function to handle auto-submission
  const handleAutoSubmit = async (reason = "tab switches") => {
    // Only check if it's already submitted.
    if (submittedRef.current) {
      console.log("Auto-submit already in progress, skipping...");
      return;
    }

    try {
      console.log("Auto-submitting exam due to:", reason);
      isAutoSubmitting.current = true;
      submittedRef.current = true;
      setSubmitted(true);

      // Stop camera proctoring
      stopCameraProctoring();

      // Clear all intervals
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }

      if (timeCountdownInterval.current) {
        clearInterval(timeCountdownInterval.current);
        timeCountdownInterval.current = null;
      }
      
      // Mark as submitted to prevent further interval callbacks
      submittedRef.current = true;

      // Remove the modal if it exists
      if (modalDiv.current && modalDiv.current.parentNode) {
        modalDiv.current.parentNode.removeChild(modalDiv.current);
      }

      await api.post("/exams/submit", {
        examId: id,
        answers,
        autoSubmitted: true,
        tabSwitches: reason === "tab switches" ? 3 : tabSwitches,
        duration: Math.floor((Date.now() - examStartTime.current) / 1000),
        timeExceeded: reason === "time limit",
        proctoringData: proctoringData,
      });

      toast.info(
        `Your exam has been submitted automatically due to ${reason}.`,
        {
          position: "top-center",
          autoClose: 3000,
        }
      );

      // Force navigation to home page
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Error auto-submitting exam:", error);
      // Only show error toast if not already auto-submitting
      if (!isAutoSubmitting.current) {
        toast.error("Failed to submit exam automatically. Please try again.");
      }
      // Reset the flag to allow retry
      isAutoSubmitting.current = false;
    } finally {
      if (timeCountdownInterval.current) {
        clearInterval(timeCountdownInterval.current);
        timeCountdownInterval.current = null;
      }
    }
  };

  // Function to handle time countdown
  const startTimeCountdown = (timeLimit) => {
    if (submittedRef.current) {
      console.log("Timer not starting: already submitted");
      return;
    }
    console.log("Starting countdown with timeLimit:", timeLimit);
    if (!timeLimit || timeLimit <= 0) {
      console.log("No valid timeLimit provided");
      return;
    }

    // Clear any existing interval first
    if (timeCountdownInterval.current) {
      console.log("Clearing existing interval");
      clearInterval(timeCountdownInterval.current);
      timeCountdownInterval.current = null;
    }

    // Reset exam start time when timer actually starts
    examStartTime.current = Date.now();
    const timeLimitInSeconds = timeLimit * 60;
    const endTime = examStartTime.current + timeLimitInSeconds * 1000;

    console.log("Time limit in seconds:", timeLimitInSeconds);
    console.log("Exam start time:", new Date(examStartTime.current));
    console.log("End time:", new Date(endTime));
    console.log("submittedRef.current:", submittedRef.current);
    console.log("isAutoSubmitting.current:", isAutoSubmitting.current);

    // Set initial time remaining (already set above, but ensure it's correct)
    setTimeRemaining(timeLimitInSeconds);
    
    console.log("Creating interval...");
    timeCountdownInterval.current = setInterval(() => {
      // Check ref instead of state to avoid stale closures
      if (submittedRef.current) {
        console.log("Stopping timer: submitted");
        if (timeCountdownInterval.current) {
          clearInterval(timeCountdownInterval.current);
          timeCountdownInterval.current = null;
        }
        return;
      }
      
      if (isAutoSubmitting.current) {
        console.log("Stopping timer: auto-submitting");
        if (timeCountdownInterval.current) {
          clearInterval(timeCountdownInterval.current);
          timeCountdownInterval.current = null;
        }
        return;
      }
      
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

      // Stop if time is already up
      if (remaining <= 0) {
        console.log("Time is up!");
        setTimeRemaining(0);
        if (!isAutoSubmitting.current && !submittedRef.current) {
          console.log("Time is up! Auto-submitting...");
          isAutoSubmitting.current = true;
          submittedRef.current = true;
          if (timeCountdownInterval.current) {
            clearInterval(timeCountdownInterval.current);
            timeCountdownInterval.current = null;
          }
          handleAutoSubmit("time limit");
        }
        return;
      }

      console.log("Timer tick - remaining:", remaining, "seconds");
      setTimeRemaining(remaining);

      // Show warnings at specific intervals
      if (remaining === 300) {
        // 5 minutes
        showToast("timeWarning", "Warning: 5 minutes remaining!", {
          autoClose: 5000,
        });
      } else if (remaining === 60) {
        // 1 minute
        showToast("timeWarning", "Warning: 1 minute remaining!", {
          autoClose: 5000,
        });
      } else if (remaining === 30) {
        // 30 seconds
        showToast("timeWarning", "Warning: 30 seconds remaining!", {
          autoClose: 5000,
        });
      } else if (remaining === 0) {
        // Time's up - auto-submit (only once)
        if (!submittedRef.current) {
          console.log("Time is up! Auto-submitting...");
          isAutoSubmitting.current = true;
          if (timeCountdownInterval.current) {
            clearInterval(timeCountdownInterval.current);
            timeCountdownInterval.current = null;
          }
          handleAutoSubmit("time limit");
        }
      }
    }, 1000);
  };

  // Function to handle copy-paste prevention
  const preventCopyPaste = (e) => {
    e.preventDefault();
    showToast("copyPaste", "Copy-paste is not allowed during the exam!");
    return false;
  };

  // Function to handle right-click prevention
  const preventRightClick = (e) => {
    e.preventDefault();
    showToast("rightClick", "Right-click is not allowed during the exam!");
    return false;
  };

  // Function to handle keyboard shortcuts
  const preventKeyboardShortcuts = (e) => {
    if (isAutoSubmitting.current) return;

    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "a")
    ) {
      e.preventDefault();
      showToast(
        "keyboardShortcut",
        "Keyboard shortcuts are not allowed during the exam!"
      );
    }
  };

  useEffect(() => {
    // Add event listeners for anti-cheating measures
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("cut", preventCopyPaste);
    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("keydown", preventKeyboardShortcuts);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("keydown", preventKeyboardShortcuts);

      // Stop camera proctoring
      stopCameraProctoring();

      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }

      if (timeCountdownInterval.current) {
        clearInterval(timeCountdownInterval.current);
      }

      // Remove the modal if it exists
      if (modalDiv.current && modalDiv.current.parentNode) {
        modalDiv.current.parentNode.removeChild(modalDiv.current);
      }

      // Dismiss all toasts
      Object.values(toastIds.current).forEach((id) => {
        if (id) toast.dismiss(id);
      });
      
      // Mark as submitted to prevent any lingering intervals
      submittedRef.current = true;
    };
  }, []);

  useEffect(() => {
    // For students, do NOT fetch the exam until camera permission is granted.
    // This ensures the timer never starts and no exam data loads before the gate.
    if (role === "student" && !cameraPermissionGranted) return;

    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/exams/${id}`);

        console.log("Fetched exam data:", response.data);
        console.log("User role:", role);
        console.log("Exam timeLimit:", response.data.timeLimit);

        setExam(response.data);
        setAnswers(Array(response.data.questions.length).fill(""));
        setError(null);

        // Reset exam start time when exam data is fetched
        examStartTime.current = Date.now();
        // Set initial timeRemaining immediately so UI updates correctly
        if (role === "student" && response.data.timeLimit) {
          setTimeRemaining(response.data.timeLimit * 60);
        } else {
          setTimeRemaining(null);
        }

        // Start the countdown timer if user is a student and exam has timeLimit
        if (role === "student" && response.data.timeLimit) {
          console.log(
            "Starting timer for student with timeLimit:",
            response.data.timeLimit
          );
          submittedRef.current = false;
          isAutoSubmitting.current = false;
          startTimeCountdown(response.data.timeLimit);
        } else {
          console.log(
            "Not starting timer. Role:",
            role,
            "TimeLimit:",
            response.data.timeLimit
          );
        }
      } catch (error) {
        console.error("Error fetching exam:", error);

        if (error.response && error.response.status === 403) {
          setError(error.response.data.message);
          setTimeout(() => {
            navigate("/results");
          }, 3000);
        } else {
          setError("Failed to load exam. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, navigate, role, user, cameraPermissionGranted]);

  // Ensure camera proctoring starts ONLY when the video element is in the DOM
  // which is after loading finishes and if there are no errors.
  useEffect(() => {
    if (!loading && !error && role === "student" && cameraPermissionGranted && !cameraActive) {
      startCameraProctoring();
    }
  }, [loading, error, role, cameraPermissionGranted, cameraActive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittedRef.current || isAutoSubmitting.current) return;
    try {
      stopCameraProctoring();
      submittedRef.current = true;
      setSubmitted(true);
      const duration = Math.floor((Date.now() - examStartTime.current) / 1000);
      const timeLimitInSeconds = exam?.timeLimit ? exam.timeLimit * 60 : 0;
      const timeExceeded =
        timeLimitInSeconds > 0 && duration > timeLimitInSeconds;
      await api.post("/exams/submit", {
        examId: id,
        answers,
        duration: duration,
        timeExceeded: timeExceeded,
        proctoringData: proctoringData,
      });
      toast.success("Exam submitted successfully!", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate("/results");
      }, 1000);
    } catch (error) {
      submittedRef.current = false;
      setSubmitted(false);
      console.error("Error submitting exam:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Failed to submit exam", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.error("Network error. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } finally {
      if (timeCountdownInterval.current) {
        clearInterval(timeCountdownInterval.current);
        timeCountdownInterval.current = null;
      }
    }
  };

  // --- Camera Permission Gate (students only) ---
  // This renders FIRST — before loading or exam content — so the exam
  // never fetches or starts the timer until the camera is granted.
  if (role === "student" && !cameraPermissionGranted) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2a4a 100%)",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        {/* Ambient glow effects */}
        <div style={{
          position: "absolute", top: "20%", left: "30%",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "25%",
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          maxWidth: 460,
          width: "calc(100% - 32px)",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%)",
            padding: "36px 32px 28px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
            }} />
            {/* Camera icon */}
            <div style={{
              width: 72, height: 72,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              position: "relative",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 6px", position: "relative" }}>
              Camera Access Required
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0, position: "relative" }}>
              Your camera must be enabled to begin this proctored exam.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px 32px" }}>

            {/* Info bullets */}
            <div style={{ marginBottom: 24 }}>
              {[
                { icon: "🎥", color: "#3b82f6", text: "Your camera is used only for live proctoring during this exam." },
                { icon: "📸", color: "#8b5cf6", text: "Periodic screenshots will be reviewed by your instructor." },
                { icon: "🚫", color: "#ef4444", text: "You cannot start the exam without granting camera access." },
              ].map(({ icon, color, text }, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 14px", marginBottom: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderRadius: 12,
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1.4 }}>{icon}</span>
                  <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Error state */}
            {cameraPermissionError && (
              <div style={{
                marginBottom: 20,
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 12,
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span style={{ color: "#f87171", fontSize: 13, fontWeight: 600 }}>Camera Permission Denied</span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  {cameraPermissionError}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(248,113,113,0.8)" }}>
                  💡 <strong>Fix:</strong> Click the camera icon in your browser's address bar → select <strong>"Allow"</strong> → then click Retry below.
                </p>
              </div>
            )}

            {/* Action button */}
            <button
              id="camera-permission-btn"
              onClick={requestCameraPermission}
              disabled={requestingCamera}
              style={{
                width: "100%",
                padding: "14px 24px",
                borderRadius: 14,
                border: "none",
                cursor: requestingCamera ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: 15,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.2s ease",
                background: requestingCamera
                  ? "rgba(99,102,241,0.5)"
                  : cameraPermissionError
                  ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                  : "linear-gradient(135deg, #2563eb, #7c3aed)",
                boxShadow: requestingCamera ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
              }}
            >
              {requestingCamera ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite", width: 20, height: 20 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Requesting Camera Access...
                </>
              ) : cameraPermissionError ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Camera Access
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  Enable Camera & Start Exam
                </>
              )}
            </button>

            <p style={{ textAlign: "center", margin: "14px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              🔒 Camera access is mandatory and cannot be skipped.
            </p>
          </div>
        </div>

        {/* Spin keyframe */}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  // --- End Camera Permission Gate ---

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading exam...</p>
        <ToastContainer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
        <p>{error}</p>
        <p className="mt-2">Redirecting to your results page...</p>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-[55vh]">
      <ToastContainer limit={1} />

      {/* Camera Proctoring Section */}
      {role === "student" && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800">
              Proctoring Camera
            </h3>
            <div
              className={`w-3 h-3 rounded-full ${
                cameraActive ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
          </div>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-32 h-24 object-cover rounded border"
            style={{ display: cameraActive ? "block" : "none" }}
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="mt-2 text-xs">
            <div
              className={`flex items-center ${
                faceDetected ? "text-green-600" : "text-red-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  faceDetected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              {faceDetected ? "Face Detected" : "No Face Detected"}
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
        <p className="font-bold">Exam Security Notice:</p>
        <p>
          Copy-paste, right-click, and tab switching are disabled. You have{" "}
          {3 - tabSwitches} tab switches remaining.
        </p>
        {role === "student" && (
          <p className="mt-2 text-sm">
            Camera proctoring is active. Please stay in front of the camera.
          </p>
        )}
      </div>

      {/* Time Remaining Display */}
      {role === "student" && (
        <div
          className={`border-l-4 p-4 mb-4 ${
            timeRemaining === null
              ? "bg-gray-100 border-gray-500 text-gray-700"
              : timeRemaining <= 300
              ? "bg-red-100 border-red-500 text-red-700"
              : timeRemaining <= 600
              ? "bg-orange-100 border-orange-500 text-orange-700"
              : "bg-blue-100 border-blue-500 text-blue-700"
          }`}
        >
          <p className="font-bold">Time Remaining:</p>
          {timeRemaining !== null ? (
            <p className="text-lg font-mono">
              {Math.floor(timeRemaining / 60)}:
              {(timeRemaining % 60).toString().padStart(2, "0")}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              {exam?.timeLimit
                ? `Timer will start soon (${exam.timeLimit} minutes)`
                : "No time limit set"}
            </p>
          )}
        </div>
      )}

      {exam && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md"
        >
          <h2 className="text-xl font-bold mb-4">{exam.title}</h2>
          {exam.questions.map((question, index) => (
            <div
              key={index}
              className="mb-4 p-4 border border-gray-200 rounded"
            >
              <p className="font-semibold">{question.question}</p>
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="block mt-2 ml-2">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={() => {
                      const newAnswers = [...answers];
                      newAnswers[index] = option;
                      setAnswers(newAnswers);
                    }}
                    className="mr-2"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ))}
          {role === "student" ? (
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
              disabled={submitted || isAutoSubmitting.current}
            >
              {submitted || isAutoSubmitting.current
                ? "Submitting..."
                : "Submit Exam"}
            </button>
          ) : (
            <button
              className="bg-red-500 text-white p-2 rounded transition"
              disabled
            >
              Author can't Attempt
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default Exam;
