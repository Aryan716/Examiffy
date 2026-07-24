import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    
    const role = user?.role;
    const username = user?.username || '';
    
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
   
    if (!isAuthenticated) {
        return null;
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50" style={{
            background: 'rgba(10, 14, 26, 0.8)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
                            background: 'var(--gradient-primary)',
                            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold gradient-text">Examify</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { path: '/dashboard', label: 'Dashboard', show: true },
                            { path: '/create-exam', label: 'Create Exam', show: role === 'examiner' },
                            { path: '/results', label: 'Results', show: role !== 'examiner' },
                        ].filter(item => item.show).map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                style={{
                                    color: isActive(item.path) ? '#e2e8f0' : '#94a3b8',
                                    background: isActive(item.path) ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive(item.path)) {
                                        e.currentTarget.style.color = '#cbd5e1';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive(item.path)) {
                                        e.currentTarget.style.color = '#94a3b8';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                {isActive(item.path) && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full" style={{
                                        background: 'var(--gradient-primary)',
                                    }} />
                                )}
                                {item.label}
                            </Link>
                        ))}
                        
                        {/* Profile Dropdown */}
                        <div className="relative ml-3">
                            <button 
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                style={{
                                    background: isProfileOpen ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                                    border: '1px solid transparent',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isProfileOpen) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{
                                    background: 'var(--gradient-primary)',
                                }}>
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium" style={{ color: '#cbd5e1' }}>{username}</span>
                                <ChevronDown size={14} style={{ color: '#64748b', transition: 'transform 0.2s', transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                            </button>
                            
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-56 py-2 rounded-xl overflow-hidden"
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                                        }}
                                    >
                                        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                            <p className="text-xs font-medium" style={{ color: '#64748b' }}>Signed in as</p>
                                            <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>{username}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full" style={{
                                                background: 'rgba(124, 58, 237, 0.15)',
                                                color: '#a78bfa',
                                            }}>
                                                {role}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors duration-150"
                                            style={{ color: '#ef4444' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <LogOut size={15} />
                                            Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="p-2 rounded-lg transition-colors"
                            style={{
                                color: '#94a3b8',
                                background: isMenuOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
                            }}
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
                
                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden overflow-hidden"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="py-3 space-y-1">
                                <Link 
                                    to="/dashboard" 
                                    className="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                    style={{
                                        color: isActive('/dashboard') ? '#e2e8f0' : '#94a3b8',
                                        background: isActive('/dashboard') ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                                    }}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                
                                {role === 'examiner' && (
                                    <Link 
                                        to="/create-exam" 
                                        className="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                        style={{
                                            color: isActive('/create-exam') ? '#e2e8f0' : '#94a3b8',
                                            background: isActive('/create-exam') ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                                        }}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Create Exam
                                    </Link>
                                )}
                                
                                {role !== 'examiner' && (
                                    <Link 
                                        to="/results" 
                                        className="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                        style={{
                                            color: isActive('/results') ? '#e2e8f0' : '#94a3b8',
                                            background: isActive('/results') ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                                        }}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Results
                                    </Link>
                                )}
                                
                                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="px-4 py-2 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{
                                            background: 'var(--gradient-primary)',
                                        }}>
                                            {username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{username}</p>
                                            <p className="text-xs" style={{ color: '#64748b' }}>{role}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 rounded-lg mt-1 transition-colors"
                                        style={{ color: '#ef4444' }}
                                    >
                                        <LogOut size={15} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;