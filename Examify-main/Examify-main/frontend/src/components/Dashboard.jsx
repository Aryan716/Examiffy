/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Plus, Award, Eye, Clock, FileText, ChevronRight, AlertCircle } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const role = user?.role;

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await api.get("/exams");
        setExams(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching exams", error);
        setError("Failed to load exams. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const getMessageForEmptyExams = () => {
    if (role === "examiner") {
      return "You haven't created any exams yet.";
    } else {
      return "You've completed all available exams! Check your results page to see how you did.";
    }
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
    <div className="max-w-6xl mx-auto min-h-screen">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <BookOpen size={28} className="text-indigo-400" />
            </div>
            {role === "examiner" ? "Your Created Exams" : "Available Exams"}
          </h1>
          <p className="text-slate-400 mt-2 ml-14">
            {role === "examiner" ? "Manage and monitor your assessments." : "Ready to test your knowledge? Select an exam below."}
          </p>
        </div>

        {role === "examiner" && (
          <Link to="/create-exam">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Create New Exam
            </motion.button>
          </Link>
        )}
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
      ) : exams.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {exams.map((exam) => (
            <motion.div
              key={exam._id}
              variants={itemVariants}
              className="card-glass p-6 flex flex-col h-full group"
            >
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-bold text-xl text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {exam.title}
                  </h2>
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                    <FileText size={20} className="text-slate-400" />
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <BookOpen size={18} className="text-cyan-400 mr-3" />
                    <span className="font-medium">{exam.questions?.length || 0}</span>
                    <span className="ml-1 text-slate-400">Questions</span>
                  </div>
                  
                  {exam.timeLimit && (
                    <div className="flex items-center text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                      <Clock size={18} className="text-orange-400 mr-3" />
                      <span className="font-medium">{exam.timeLimit}</span>
                      <span className="ml-1 text-slate-400">Minutes</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <Link to={`/exam/${exam._id}`} className="block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary flex items-center justify-between"
                  >
                    {role === "examiner" ? "Preview Exam" : "Take Exam"}
                    <ChevronRight size={18} />
                  </motion.button>
                </Link>

                {role === "examiner" && (
                  <Link to={`/proctoring/${exam._id}`} className="block">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full btn-secondary flex items-center justify-center gap-2 text-sm py-2.5"
                    >
                      <Eye size={16} />
                      Proctoring Dashboard
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass p-12 text-center max-w-2xl mx-auto mt-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-glow">
              <Award size={48} className="text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">All Caught Up!</h3>
            <p className="text-slate-400 mb-8 text-lg">
              {getMessageForEmptyExams()}
            </p>

            {role === "examiner" ? (
              <Link to="/create-exam">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Your First Exam
                </motion.button>
              </Link>
            ) : (
              <Link to="/results">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Award size={20} />
                  View Your Results
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
