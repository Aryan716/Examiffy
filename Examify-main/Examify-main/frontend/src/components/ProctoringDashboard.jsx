import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { ShieldAlert, Users, AlertTriangle, Eye, Clock, Image as ImageIcon, CheckCircle, Search, FileText } from "lucide-react";

const ProctoringDashboard = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    // Only examiners can access this
    if (user?.role !== "examiner") {
      navigate("/dashboard");
      return;
    }

    const fetchProctoringData = async () => {
      try {
        const response = await api.get(`/proctoring/exam/${examId}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching proctoring data:", err);
        setError("Failed to load proctoring data");
      } finally {
        setLoading(false);
      }
    };

    fetchProctoringData();

    // Set up auto-refresh every 30 seconds for live monitoring
    const intervalId = setInterval(fetchProctoringData, 30000);
    return () => clearInterval(intervalId);
  }, [examId, navigate, user]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "low":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const getStatusIndicator = (report) => {
    if (!report.examResult) return { color: "bg-blue-500", text: "In Progress" };
    return report.examResult.passed 
      ? { color: "bg-emerald-500", text: "Passed" }
      : { color: "bg-red-500", text: "Failed" };
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="loading-spinner mb-6"></div>
        <p className="text-slate-400 text-lg font-medium animate-pulse">Loading proctoring data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-5 rounded-xl shadow-lg flex items-start gap-4">
        <AlertTriangle className="shrink-0 mt-0.5" size={24} />
        <div>
          <p className="font-bold text-lg mb-1">{error}</p>
          <p className="text-red-300/80 text-sm">Please verify the exam ID and your permissions.</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const filteredReports = data.reports.filter(report => 
    report.student.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto min-h-screen pb-12 px-4">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              Live Monitoring
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Auto-updating
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            {data.exam.title}
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <ShieldAlert size={16} className="text-indigo-400" />
            Proctoring & Security Dashboard
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 bg-slate-900/80"
          />
        </div>
      </motion.div>

      {/* Summary Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8"
      >
        {[
          { icon: <Users className="text-blue-400" />, label: "Total Students", value: data.summary.totalStudents, color: "border-blue-500/30", bg: "bg-blue-500/10" },
          { icon: <AlertTriangle className="text-amber-400" />, label: "Violations", value: data.summary.totalViolations, color: "border-amber-500/30", bg: "bg-amber-500/10" },
          { icon: <Eye className="text-purple-400" />, label: "No Face Incidents", value: data.summary.avgNoFaceEvents > 0 ? Math.round(data.summary.avgNoFaceEvents) : 0, color: "border-purple-500/30", bg: "bg-purple-500/10" },
          { icon: <ImageIcon className="text-emerald-400" />, label: "Screenshots", value: data.reports.reduce((acc, r) => acc + r.screenshots.length, 0), color: "border-emerald-500/30", bg: "bg-emerald-500/10" }
        ].map((stat, i) => (
          <div key={i} className="card-glass p-6 border-t-2 relative overflow-hidden group" style={{ borderTopColor: stat.color.split('/')[0].replace('border-', '') }}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 ${stat.bg}`} />
            <div className="relative z-10 flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-3 border border-slate-700 shadow-lg">
                {stat.icon}
              </div>
              <span className="text-3xl font-bold text-white mb-1">{stat.value}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Student List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-indigo-400" />
            Student Reports
          </h2>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredReports.length === 0 ? (
              <div className="text-center p-8 bg-slate-900/50 rounded-xl border border-white/5">
                <p className="text-slate-400">No students found matching your search.</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const status = getStatusIndicator(report);
                const isSelected = selectedStudent?._id === report._id;
                
                return (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedStudent(report)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected 
                        ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                        : "bg-slate-900/80 border-white/5 hover:border-white/10 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-white text-base">{report.student.username}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                          <span className="text-xs text-slate-400">{status.text}</span>
                        </div>
                      </div>
                      
                      {report.violations.length > 0 && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded-md border border-red-500/20 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          {report.violations.length} Flags
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Face Missing</span>
                        <span className="text-sm font-medium text-white flex items-center gap-1">
                          <Eye size={14} className="text-slate-400" />
                          {report.noFaceCount}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Tab Switches</span>
                        <span className="text-sm font-medium text-white flex items-center gap-1">
                          <FileText size={14} className="text-slate-400" />
                          {report.tabSwitches}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={selectedStudent._id}
              className="card-glass h-full flex flex-col overflow-hidden"
            >
              {/* Detail Header */}
              <div className="p-6 md:p-8 bg-slate-900/50 border-b border-white/5 flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedStudent.student.username}'s Report</h2>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {selectedStudent.examResult && (
                      <span className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                        <CheckCircle size={16} className={selectedStudent.examResult.passed ? "text-emerald-400" : "text-red-400"} />
                        Score: <span className="font-bold text-white">{selectedStudent.examResult.score}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <FileText size={16} className="text-indigo-400" />
                      Tab Switches: <span className="font-bold text-white">{selectedStudent.tabSwitches}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <Clock size={16} className="text-cyan-400" />
                      Started: <span className="font-medium text-white">{new Date(selectedStudent.startTime).toLocaleTimeString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                
                {/* Violations Section */}
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-400" />
                    Security Violations ({selectedStudent.violations.length})
                  </h3>
                  
                  {selectedStudent.violations.length > 0 ? (
                    <div className="space-y-3">
                      {selectedStudent.violations.map((violation, index) => (
                        <div key={index} className={`p-4 rounded-xl border flex items-start gap-4 ${getSeverityColor(violation.severity)}`}>
                          <div className="shrink-0 mt-0.5">
                            <AlertTriangle size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold capitalize">{violation.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/20 opacity-80">
                                {violation.severity} severity
                              </span>
                            </div>
                            <p className="text-sm opacity-90 mb-2">{violation.description}</p>
                            <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded opacity-75">
                              {new Date(violation.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-xl flex items-center justify-center gap-3">
                      <CheckCircle size={24} />
                      <p className="font-medium">No violations recorded for this student. Good!</p>
                    </div>
                  )}
                </div>

                {/* Screenshots Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ImageIcon size={18} className="text-cyan-400" />
                    Proctoring Snapshots ({selectedStudent.screenshots.length})
                  </h3>
                  
                  {selectedStudent.screenshots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedStudent.screenshots.map((shot, index) => (
                        <div key={index} className="group relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 aspect-video">
                          <img 
                            src={api.defaults.baseURL.replace('/api', '') + shot.imageUrl} 
                            alt={`Proctoring snapshot ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "https://via.placeholder.com/640x480.png?text=Image+Not+Found";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80"></div>
                          
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-xs font-mono mb-1.5 flex items-center gap-1.5">
                              <Clock size={12} className="text-slate-400" />
                              {new Date(shot.timestamp).toLocaleTimeString()}
                            </p>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider
                              ${shot.faceDetected ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${shot.faceDetected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                              {shot.faceDetected ? "Face Detected" : "No Face"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 border border-white/5 p-8 text-center rounded-xl">
                      <ImageIcon size={32} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No screenshots captured yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card-glass h-full flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
              <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-glow">
                <Eye size={48} className="text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Select a Student</h2>
              <p className="text-slate-400 max-w-sm">
                Click on a student from the list to view their detailed proctoring report, security violations, and camera snapshots.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProctoringDashboard;