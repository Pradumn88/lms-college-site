import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminContext } from '../../Context/AdminContext.jsx';

const AdminStudents = () => {
    const { students, fetchStudents, removeStudent, getStudentDetails } = useContext(AdminContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            await fetchStudents();
            setLoading(false);
        };
        load();
    }, []);

    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRemove = (studentId, name) => {
        if (window.confirm(`Are you sure you want to remove "${name}" from the platform? This will delete their account and enrollment data.`)) {
            removeStudent(studentId);
        }
    };

    const handleViewDetails = async (studentId) => {
        setSelectedStudent(studentId);
        setDetailsLoading(true);
        const details = await getStudentDetails(studentId);
        if (details) {
            setStudentDetails(details);
        }
        setDetailsLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Students</h1>
                    <p className="text-gray-400">Manage all registered students</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                </div>
            </div>

            {/* Students Table */}
            {filteredStudents.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <span className="text-4xl mb-4 block">🎓</span>
                    <p className="text-gray-400">No students found</p>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Student</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Email</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Enrolled</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Purchases</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Total Spent</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <motion.tr
                                        key={student._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border-t border-slate-700/50 hover:bg-slate-700/30"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={student.imageUrl || '/user_icon.svg'}
                                                    alt={student.name}
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                                                />
                                                <span className="text-white font-medium">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-300 text-sm">{student.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                                {student.enrolledCount || 0} courses
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-300">{student.purchaseCount || 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-400 font-medium">${student.totalSpent?.toFixed(2) || '0.00'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(student._id)}
                                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(student._id, student.name)}
                                                    className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Student Details</h2>
                            <button
                                onClick={() => { setSelectedStudent(null); setStudentDetails(null); }}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {detailsLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : studentDetails ? (
                                <div className="space-y-6">
                                    {/* Student Info */}
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={studentDetails.student.imageUrl || '/user_icon.svg'}
                                            alt={studentDetails.student.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/30"
                                        />
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">{studentDetails.student.name}</h3>
                                            <p className="text-gray-400">{studentDetails.student.email}</p>
                                        </div>
                                    </div>

                                    {/* Enrolled Courses */}
                                    <div>
                                        <h4 className="text-white font-medium mb-3">Enrolled Courses ({studentDetails.student.enrolledCourses?.length || 0})</h4>
                                        <div className="space-y-2">
                                            {studentDetails.student.enrolledCourses?.map(course => (
                                                <div key={course._id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                                                    <img
                                                        src={course.thumbnail || '/course_placeholder.png'}
                                                        alt={course.courseTitle}
                                                        className="w-12 h-8 rounded object-cover"
                                                    />
                                                    <span className="text-gray-300 text-sm">{course.courseTitle}</span>
                                                </div>
                                            )) || <p className="text-gray-500 text-sm">No courses enrolled</p>}
                                        </div>
                                    </div>

                                    {/* Purchase History */}
                                    <div>
                                        <h4 className="text-white font-medium mb-3">Purchase History</h4>
                                        <div className="space-y-2">
                                            {studentDetails.purchases?.map(purchase => (
                                                <div key={purchase._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                                    <div>
                                                        <p className="text-gray-300 text-sm">{purchase.courseId?.courseTitle || 'Deleted Course'}</p>
                                                        <p className="text-gray-500 text-xs">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-green-400 font-medium">${purchase.amount}</p>
                                                        <span className={`text-xs ${purchase.status === 'Completed' ? 'text-green-400' :
                                                                purchase.status === 'Pending' ? 'text-yellow-400' : 'text-red-400'
                                                            }`}>
                                                            {purchase.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            )) || <p className="text-gray-500 text-sm">No purchases found</p>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center">Failed to load details</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminStudents;
