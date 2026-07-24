/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { CheckCircle, Clock, Shield, ChevronRight, BookOpen, Users, BarChart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl relative">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 glass border-indigo-500/30">
              <BookOpen size={16} className="text-cyan-400" />
              <span className="text-sm font-medium text-slate-300">Examify Platform 2.0</span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white leading-tight"
            >
              Revolutionize Your <br className="hidden md:block" />
              <span className="gradient-text">Online Examination</span> Experience
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Create, manage, and analyze exams with unparalleled security and real-time insights. The all-in-one platform trusted by leading educational institutions worldwide.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <motion.a
                href={isAuthenticated ? "/dashboard" : "/signup"}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4 w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
                <ChevronRight size={20} />
              </motion.a>
              <motion.a
                href="/demo"
                className="btn-secondary flex items-center gap-2 text-lg px-8 py-4 w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                View Demo
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Abstract Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto max-w-5xl mt-20"
          >
            <div className="card-glass p-2 relative z-10 glow-primary">
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                 <div className="text-center z-10">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.5)] animate-float">
                        <Shield size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Secure AI Proctoring</h3>
                    <p className="text-slate-400 max-w-md mx-auto">Advanced face detection, tab-switching prevention, and automated violation tracking.</p>
                 </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              className="absolute -top-10 -right-10 glass p-4 rounded-2xl z-20 animate-float"
              style={{ animationDelay: '1s' }}
            >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <BarChart size={24} className="text-cyan-400" />
                 </div>
                 <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Analytics</p>
                    <p className="text-lg font-bold text-white">Real-time Insights</p>
                 </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-10 -left-10 glass p-4 rounded-2xl z-20 animate-float"
              style={{ animationDelay: '2s' }}
            >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Shield size={24} className="text-indigo-400" />
                 </div>
                 <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Security</p>
                    <p className="text-lg font-bold text-white">99.9% Cheat Prevention</p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-2 block">Why Choose Examify</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Powerful Features for Modern Education</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Our platform combines cutting-edge technology with intuitive design to create the perfect examination experience.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield size={28} className="text-indigo-400" />, title: "Advanced Security", desc: "Prevent cheating with AI-powered face detection and environment proctoring." },
              { icon: <Clock size={28} className="text-cyan-400" />, title: "Time-Saving", desc: "Automated grading, instant results, and streamlined certificate generation." },
              { icon: <BarChart size={28} className="text-indigo-400" />, title: "Deep Analytics", desc: "Comprehensive performance insights at student, class, and exam levels." },
              { icon: <Users size={28} className="text-cyan-400" />, title: "Scalable Platform", desc: "Built to handle thousands of concurrent test-takers without breaking a sweat." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="card-glass p-8 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-14 h-14 bg-slate-800/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700/50">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            className="flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest text-center">Trusted by forward-thinking institutions</p>

            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
                {["Harvard", "MIT", "Stanford", "Oxford", "Cambridge"].map((logo, idx) => (
                <motion.div
                    key={idx}
                    className="text-2xl font-bold uppercase tracking-wider text-slate-600 hover:text-white transition-colors cursor-default"
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                >
                    {logo}
                </motion.div>
                ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Glow behind stats */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {[
              { number: "99.9%", label: "Uptime" },
              { number: "2M+", label: "Exams Taken" },
              { number: "5K+", label: "Institutions" },
              { number: "150+", label: "Countries" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="card-glass p-8"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3">{stat.number}</h3>
                <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto card-glass p-12 md:p-20 relative overflow-hidden"
          >
            {/* CTA Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 opacity-50" />
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Ready to transform your <br className="hidden md:block"/> examination process?</h2>
                <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">Join thousands of educators who have already made the switch to Examify's secure platform.</p>
                <motion.a
                href={isAuthenticated ? "/dashboard" : "/signup"}
                className="btn-primary inline-flex items-center text-lg px-10 py-5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                >
                Get Started Today
                <ChevronRight size={22} className="ml-2" />
                </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}