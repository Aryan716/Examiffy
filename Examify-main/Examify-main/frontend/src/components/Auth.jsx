import React, { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ShieldCheck, UserCheck, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    const endpoint = isRegistering ? "/register" : "/login";

    try {
      const response = await api.post(`/auth${endpoint}`, { username, password, role });

      if (isRegistering) {
        setSuccessMessage("Registration successful! You can now log in.");
        setTimeout(() => setIsRegistering(false), 2000);
      } else {
        const userData = {
          username: response.data.username,
          role: response.data.role,
        };
        login(userData);
        await checkAuth();
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden glass-strong shadow-2xl relative z-10">
        
        {/* Left Panel - Branding/Info (Hidden on small screens) */}
        <div className="hidden md:flex md:w-5/12 p-12 flex-col justify-between relative overflow-hidden bg-slate-900/50">
          {/* Abstract gradients */}
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-br from-indigo-600/30 via-transparent to-cyan-500/20 blur-3xl z-0" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {isRegistering ? "Join Examify" : "Welcome Back"}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              {isRegistering 
                ? "Create an account to experience the next generation of secure, AI-proctored online examinations."
                : "Log in to access your dashboard, take upcoming exams, or review your past results."}
            </p>
            
            <div className="space-y-5">
              {[
                { icon: <ShieldCheck size={20} className="text-indigo-400" />, text: "Bank-grade security & proctoring" },
                { icon: <UserCheck size={20} className="text-cyan-400" />, text: "Seamless identity verification" },
                { icon: <AlertCircle size={20} className="text-indigo-400" />, text: "Real-time anomaly detection" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-200">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
            <div className="flex -space-x-3 mb-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs font-bold ${i === 1 ? 'bg-indigo-500' : i === 2 ? 'bg-cyan-500' : i === 3 ? 'bg-purple-500' : 'bg-blue-500'}`}>
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">Trusted by over <strong className="text-white">5,000+</strong> students and examiners globally.</p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-slate-900/80 backdrop-blur-xl relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegistering ? "register" : "login"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto w-full h-full flex flex-col justify-center"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isRegistering ? "Create Account" : "Sign In"}
                </h3>
                <p className="text-slate-400 text-sm">
                  {isRegistering ? "Enter your details to get started" : "Enter your credentials to access your account"}
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                >
                  <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </motion.div>
              )}
              
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3"
                >
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-200">{successMessage}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                {isRegistering && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Account Role</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <UserCheck size={18} />
                      </div>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input-field pl-11 appearance-none bg-slate-900/50"
                        required
                      >
                        <option value="student">Student (Test Taker)</option>
                        <option value="examiner">Examiner (Test Creator)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 mt-4 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isRegistering ? "Create Account" : "Sign In"}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-slate-400 text-sm">
                  {isRegistering ? "Already have an account?" : "Don't have an account yet?"}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="ml-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors focus:outline-none"
                  >
                    {isRegistering ? "Sign In" : "Register"}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
