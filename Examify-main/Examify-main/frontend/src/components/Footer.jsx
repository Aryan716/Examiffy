import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="mt-auto border-t border-white/5 bg-slate-950/80 backdrop-blur-lg pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
                    
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4 group">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-glow transition-transform group-hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">Examify</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Next-generation online examination platform with bank-grade security and advanced AI proctoring.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all">
                                <Twitter size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all">
                                <Github size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all">
                                <Linkedin size={16} />
                            </a>
                        </div>
                    </div>
                    
                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Platform</h4>
                        <ul className="space-y-3">
                            <li><Link to="/features" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-500/0 hover:bg-cyan-500 transition-colors"></span> Features</Link></li>
                            <li><Link to="/pricing" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-500/0 hover:bg-cyan-500 transition-colors"></span> Pricing</Link></li>
                            <li><Link to="/security" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-500/0 hover:bg-cyan-500 transition-colors"></span> Security</Link></li>
                            <li><Link to="/demo" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-cyan-500/0 hover:bg-cyan-500 transition-colors"></span> Request Demo</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Resources</h4>
                        <ul className="space-y-3">
                            <li><Link to="/help" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Help Center</Link></li>
                            <li><Link to="/docs" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">API Documentation</Link></li>
                            <li><Link to="/blog" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Blog</Link></li>
                            <li><Link to="/community" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Community Forum</Link></li>
                        </ul>
                    </div>

                    {/* Legal & Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Contact</h4>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-center gap-3 text-slate-400 text-sm">
                                <Mail size={16} className="text-indigo-400" />
                                support@examify.com
                            </li>
                        </ul>
                        <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs mt-8">Legal</h4>
                        <ul className="flex flex-wrap gap-4">
                            <li><Link to="/privacy" className="text-slate-400 hover:text-white text-xs transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-slate-400 hover:text-white text-xs transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                
                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Examify Platform. All rights reserved.
                    </p>
                    <p className="text-slate-500 text-sm flex items-center gap-1.5">
                        Designed with <Heart size={14} className="text-red-500 fill-red-500/20" /> for educators
                    </p>
                </div>
            </div>
        </footer>
    );
};
