import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminContext } from '../../Context/AdminContext.jsx';

const AdminCourses = () => {
    const { courses, fetchCourses, deleteCourse, toggleCoursePublish, updateCourse } = useContext(AdminContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        const load = async () => {
            await fetchCourses();
            setLoading(false);
        };
        load();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.educatorInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (courseId, title) => {
        if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            deleteCourse(courseId);
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course._id);
        setEditForm({
            courseTitle: course.courseTitle,
            coursePrice: course.coursePrice,
            discount: course.discount
        });
    };

    const handleSaveEdit = async () => {
        const success = await updateCourse(editingCourse, editForm);
        if (success) {
            setEditingCourse(null);
        }
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
                    <h1 className="text-3xl font-bold text-white mb-2">Courses</h1>
                    <p className="text-gray-400">Manage all courses on your platform</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                </div>
            </div>

            {/* Courses Table */}
            {filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <span className="text-4xl mb-4 block">📚</span>
                    <p className="text-gray-400">No courses found</p>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Course</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Educator</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Price</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Students</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course, index) => (
                                    <motion.tr
                                        key={course._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border-t border-slate-700/50 hover:bg-slate-700/30"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={course.thumbnail || '/course_placeholder.png'}
                                                    alt={course.courseTitle}
                                                    className="w-12 h-8 rounded object-cover"
                                                />
                                                {editingCourse === course._id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.courseTitle}
                                                        onChange={(e) => setEditForm({ ...editForm, courseTitle: e.target.value })}
                                                        className="bg-slate-700 text-white px-2 py-1 rounded text-sm w-40"
                                                    />
                                                ) : (
                                                    <span className="text-white font-medium truncate max-w-[200px]">{course.courseTitle}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-300 text-sm">{course.educatorInfo?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingCourse === course._id ? (
                                                <input
                                                    type="number"
                                                    value={editForm.coursePrice}
                                                    onChange={(e) => setEditForm({ ...editForm, coursePrice: e.target.value })}
                                                    className="bg-slate-700 text-white px-2 py-1 rounded text-sm w-20"
                                                />
                                            ) : (
                                                <span className="text-green-400">${course.coursePrice}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-300">{course.enrolledCount || 0}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleCoursePublish(course._id)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${course.isPublished
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}
                                            >
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {editingCourse === course._id ? (
                                                    <>
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingCourse(null)}
                                                            className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-lg hover:bg-gray-500/30"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(course)}
                                                            className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(course._id, course.courseTitle)}
                                                            className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;
