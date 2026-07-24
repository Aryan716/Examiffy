/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Save, Clock, FileText, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";

const CreateExam = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(10);
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  };

  const handleChangeQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleChangeOption = (index, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[index].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleChangeAnswer = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].answer = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/exams", { title, timeLimit, questions });

      // Create a custom notification here instead of alert (but logic remains the same)
      const customAlert = document.createElement("div");
      customAlert.className = "fixed top-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 animate-slide-down border border-emerald-400/50";
      customAlert.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <div><h4 class="font-bold">Success</h4><p class="text-sm opacity-90">Exam created successfully!</p></div>';
      document.body.appendChild(customAlert);
      
      setTimeout(() => {
        customAlert.style.opacity = '0';
        customAlert.style.transform = 'translateY(-20px)';
        customAlert.style.transition = 'all 0.3s ease';
        setTimeout(() => customAlert.remove(), 300);
        navigate("/dashboard");
      }, 2000);
      
    } catch (error) {
      console.error("Error creating exam:", error);
      
      const customAlert = document.createElement("div");
      customAlert.className = "fixed top-4 right-4 bg-red-500/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 animate-slide-down border border-red-400/50";
      customAlert.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> <div><h4 class="font-bold">Error</h4><p class="text-sm opacity-90">Failed to create exam. Please try again.</p></div>';
      document.body.appendChild(customAlert);
      
      setTimeout(() => {
        customAlert.style.opacity = '0';
        customAlert.style.transform = 'translateY(-20px)';
        customAlert.style.transition = 'all 0.3s ease';
        setTimeout(() => customAlert.remove(), 300);
      }, 3000);
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Plus size={28} className="text-indigo-400" />
          </div>
          Create New Exam
        </h1>
        <p className="text-slate-400 mt-2 ml-14">
          Configure exam details and add questions below.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-cyan-500" />
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText size={20} className="text-indigo-400" />
            Exam Details
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-300 ml-1 block">Exam Title</label>
              <input
                type="text"
                placeholder="e.g. Midterm JavaScript Fundamentals"
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-lg py-4"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1 flex items-center gap-2">
                Time Limit <span className="text-xs text-slate-500 font-normal">(Minutes)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Clock size={18} />
                </div>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                  className="input-field pl-11 font-mono text-lg"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 ml-1">Maximum 180 minutes (3 hours)</p>
            </div>
          </div>
        </motion.div>

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle size={20} className="text-cyan-400" />
              Questions <span className="bg-indigo-500/20 text-indigo-300 py-0.5 px-2 rounded-md text-sm ml-2">{questions.length}</span>
            </h2>
          </div>

          <AnimatePresence>
            {questions.map((q, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="card-glass p-6 md:p-8 relative group"
              >
                {/* Question Number Badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 shadow-lg z-10 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-colors">
                  {index + 1}
                </div>

                <div className="space-y-6 mt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1 block">Question Text</label>
                    <textarea
                      placeholder="What is the output of..."
                      value={q.question}
                      onChange={(e) => handleChangeQuestion(index, e.target.value)}
                      className="input-field min-h-[80px] resize-y"
                      required
                    />
                  </div>

                  <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5">
                    <label className="text-sm font-semibold text-slate-300 ml-1 mb-3 block">Multiple Choice Options</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      {q.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-medium border border-slate-700">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                          </div>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            value={option}
                            onChange={(e) =>
                              handleChangeOption(index, optionIndex, e.target.value)
                            }
                            className="input-field pl-10"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-emerald-400 ml-1 flex items-center gap-1">
                      <CheckCircle2 size={16} /> Correct Answer
                    </label>
                    <input
                      type="text"
                      placeholder="Must exactly match one of the options above"
                      value={q.answer}
                      onChange={(e) => handleChangeAnswer(index, e.target.value)}
                      className="input-field border-emerald-500/30 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15),0_0_20px_rgba(16,185,129,0.1)]"
                      required
                    />
                    <p className="text-xs text-slate-400 ml-1">Copy and paste the exact text of the correct option.</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-6 z-20"
        >
          <button
            type="button"
            onClick={addQuestion}
            className="btn-secondary flex-1 py-4 flex items-center justify-center gap-2 bg-slate-900/80 backdrop-blur-md"
          >
            <Plus size={20} />
            Add Another Question
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn-primary flex-1 py-4 flex items-center justify-center gap-2 group shadow-[0_10px_30px_rgba(124,58,237,0.3)]"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={20} />
                Save & Publish Exam
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default CreateExam;
