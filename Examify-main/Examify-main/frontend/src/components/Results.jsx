/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Award, CheckCircle2, XCircle, Clock, Calendar, Download, ChevronRight, BarChart3, AlertCircle } from "lucide-react";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [downloadingCert, setDownloadingCert] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get("/exams/results/all");
        // Sort results by date (newest first)
        const sortedResults = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setResults(sortedResults);
        setError(null);
      } catch (error) {
        console.error("Error fetching results", error);
        setError("Failed to load your results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleDownloadCertificate = async (resultId) => {
    try {
      setDownloadingCert(resultId);
      const response = await api.get(`/exams/certificate/${resultId}`, {
        responseType: "blob",
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate-${resultId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloadingCert(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen pb-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <BarChart3 size={28} className="text-indigo-400" />
          </div>
          Your Exam Results
        </h1>
        <p className="text-slate-400 mt-2 ml-14">
          Track your performance and download certificates for passed exams.
        </p>
      </motion.div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-6 rounded-xl bg-red-500/10 border-red-500/20 flex flex-col items-center justify-center text-center h-64"
        >
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <p className="text-red-200 text-lg font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn-secondary text-sm px-6 py-2">
            Try Again
          </button>
        </motion.div>
      ) : results.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {results.map((result) => {
            // Check if result has exam data before rendering
            if (!result.exam) return null;
            
            const isPassed = result.passed;
            const scorePercentage = (result.score / result.totalQuestions) * 100;
            
            return (
              <motion.div
                key={result._id}
                variants={itemVariants}
                className="card-glass relative overflow-hidden"
              >
                {/* Side indicator line based on pass/fail */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                  
                  {/* Left Side: Score Circle */}
                  <div className="flex-shrink-0 relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={isPassed ? "#10b981" : "#ef4444"}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray="351.8"
                        strokeDashoffset={351.8 - (351.8 * scorePercentage) / 100}
                        style={{ transition: "stroke-dashoffset 1s ease-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{Math.round(scorePercentage)}%</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPassed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{result.exam.title}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-indigo-400" />
                          {formatDate(result.createdAt)}
                        </div>
                        {result.duration && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-cyan-400" />
                            {formatDuration(result.duration)} taken
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-sm">
                      <div className="bg-slate-900/50 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Score</span>
                        <span className="font-bold text-white">{result.score} / {result.totalQuestions}</span>
                      </div>
                      <div className="bg-slate-900/50 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status</span>
                        {isPassed ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                            <CheckCircle2 size={16} /> Pass
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 font-bold text-sm">
                            <XCircle size={16} /> Fail
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="w-full md:w-auto flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                    {isPassed ? (
                      <button
                        onClick={() => handleDownloadCertificate(result._id)}
                        disabled={downloadingCert === result._id}
                        className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto py-3.5 px-6 group"
                        style={{
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)",
                        }}
                      >
                        {downloadingCert === result._id ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Award size={20} />
                            Download Certificate
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-white/5">
                        <Award size={24} className="text-slate-500 mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-slate-400">Pass required for<br/>certificate</p>
                      </div>
                    )}
                  </div>
                  
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass p-12 text-center max-w-2xl mx-auto mt-10"
        >
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-glow">
            <BarChart3 size={48} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Results Found</h3>
          <p className="text-slate-400 mb-8 text-lg">
            You haven't completed any exams yet. Head over to the dashboard to take an exam.
          </p>

          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary inline-flex items-center gap-2"
            >
              Go to Dashboard
              <ChevronRight size={20} />
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Results;