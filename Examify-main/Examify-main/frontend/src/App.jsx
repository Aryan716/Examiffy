import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateExam from './components/CreateExam';
import Exam from './components/Exam';
import Results from './components/Results';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Home from './components/Home'
import ProctoringDashboard from './components/ProctoringDashboard';
import { Footer } from './components/Footer';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};
 
const ExaminerRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (user?.role !== 'examiner') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>

          <Route path='/' element={<Home/>}/>

          <Route path="/signup" element={<Auth />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/create-exam" element={
            <ExaminerRoute>
              <CreateExam />
            </ExaminerRoute>
          } />

          <Route path="/exam/:id" element={
            <ProtectedRoute>
              <Exam />
            </ProtectedRoute>
          } />

          <Route path="/proctoring/:examId" element={
            <ExaminerRoute>
              <ProctoringDashboard />
            </ExaminerRoute>
          } />

          <Route path="/results" element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer/>
    </Router>
  );
};

export default App;
