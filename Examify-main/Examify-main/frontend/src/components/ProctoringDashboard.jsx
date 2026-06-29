import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useParams } from 'react-router-dom';
import { Eye, AlertTriangle, Users, Clock, Camera } from 'lucide-react';

const ProctoringDashboard = () => {
    const { examId } = useParams();
    const [proctoringData, setProctoringData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchProctoringData();
        
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(fetchProctoringData, 30000);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [examId]);

    const fetchProctoringData = async () => {
        try {
            const response = await api.get(`/proctoring/exam/${examId}`);
            
            setProctoringData(response.data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching proctoring data:', error);
            if (error.response && error.response.status === 404) {
                setProctoringData([]); // No data yet
                setError(null);
            } else {
                setError('Failed to load proctoring data');
            }
        } finally {
            setLoading(false);
        }
    };

    const getViolationCount = (student) => {
        return student.violations ? student.violations.length : 0;
    };

    const getFaceDetectionRate = (student) => {
        if (!student.faceDetectionStats) return 0;
        return Math.round(student.faceDetectionStats.faceDetectionRate || 0);
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-orange-600 bg-orange-100';
            case 'low': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDuration = (startTime, endTime) => {
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const duration = Math.floor((end - start) / 1000 / 60); // minutes
        return `${duration} min`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                        <div className="flex items-center">
                            <Eye className="text-white mr-3" size={24} />
                            <h1 className="text-2xl font-bold text-white">Proctoring Dashboard</h1>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <Users className="text-blue-500 mr-2" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-600">Active Students</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {proctoringData.filter(s => !s.examEndTime).length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <Camera className="text-green-500 mr-2" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-600">Screenshots Captured</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {proctoringData.reduce((total, s) => total + (s.screenshots?.length || 0), 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <AlertTriangle className="text-orange-500 mr-2" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-600">Total Violations</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {proctoringData.reduce((total, s) => total + getViolationCount(s), 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <Clock className="text-purple-500 mr-2" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-600">Avg Session Time</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {proctoringData.length > 0 
                                                ? Math.round(proctoringData.reduce((total, s) => {
                                                    const duration = s.examEndTime && s.examStartTime 
                                                        ? Math.floor((new Date(s.examEndTime) - new Date(s.examStartTime)) / 1000 / 60)
                                                        : 0;
                                                    return total + duration;
                                                }, 0) / proctoringData.length)
                                                : 0} min
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Student Monitoring</h2>
                            
                            {proctoringData.length === 0 ? (
                                <div className="text-center py-8">
                                    <Camera className="mx-auto text-gray-400 mb-3" size={48} />
                                    <p className="text-gray-500">No proctoring data available for this exam.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {proctoringData.map((student) => (
                                        <div
                                            key={student._id}
                                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {student.userId?.username || 'Unknown Student'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Duration: {formatDuration(student.examStartTime, student.examEndTime)}
                                                    </p>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                                    student.examEndTime ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'
                                                }`}>
                                                    {student.examEndTime ? 'Completed' : 'Active'}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {student.screenshots?.length || 0}
                                                    </p>
                                                    <p className="text-xs text-gray-600">Screenshots</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {getFaceDetectionRate(student)}%
                                                    </p>
                                                    <p className="text-xs text-gray-600">Face Detection</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-red-600">
                                                        {getViolationCount(student)}
                                                    </p>
                                                    <p className="text-xs text-gray-600">Violations</p>
                                                </div>
                                            </div>

                                            {student.violations && student.violations.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Violations:</h4>
                                                    <div className="space-y-1">
                                                        {student.violations.slice(-3).map((violation, vIndex) => (
                                                            <div key={vIndex} className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-600">{violation.description}</span>
                                                                <span className={`px-2 py-1 rounded ${getSeverityColor(violation.severity)}`}>
                                                                    {violation.severity}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => setSelectedStudent(selectedStudent === student._id ? null : student._id)}
                                                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors text-sm"
                                            >
                                                {selectedStudent === student._id ? 'Hide Details' : 'View Details'}
                                            </button>

                                            {selectedStudent === student._id && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Screenshots:</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {student.screenshots
                                                            ?.filter(screenshot => screenshot.imageUrl && screenshot.imageUrl.startsWith('/uploads/'))
                                                            .slice(-6)
                                                            .map((screenshot, sIndex) => {
                                                                const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, '');
                                                                const imgUrl = `${baseUrl}${screenshot.imageUrl}`;
                                                                console.log('Screenshot URL:', imgUrl, screenshot);
                                                                return (
                                                                    <div key={sIndex} className="relative">
                                                                        <img
                                                                            src={imgUrl}
                                                                            alt={`Screenshot ${sIndex + 1}`}
                                                                            className="w-full h-20 object-cover rounded border"
                                                                        />
                                                                        <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                                                                            screenshot.faceDetected ? 'bg-green-500' : 'bg-red-500'
                                                                        }`}></div>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProctoringDashboard; 