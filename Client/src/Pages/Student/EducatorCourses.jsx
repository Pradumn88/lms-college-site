import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AppContext } from '../../Context/AppContext.jsx';

const EducatorCourses = () => {
    const { educatorId } = useParams();
    const { backend, calculateRatings, calculateNoofLectures, calculateCourseDuration, currency } = useContext(AppContext);
    const [educator, setEducator] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEducatorCourses = async () => {
            try {
                const { data } = await axios.get(`${backend}/api/user/educators/${educatorId}/courses`);
                if (data.success) {
                    setEducator(data.educator);
                    setCourses(data.courses);
                }
            } catch (error) {
                console.error('Error fetching educator courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEducatorCourses();
    }, [educatorId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!educator) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Educator not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Educator Profile Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 mb-8 text-white">
                    <Link to="/educators" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
                        ← Back to Educators
                    </Link>
                    <div className="flex items-center gap-6">
                        <img
                            src={educator.imageUrl || '/user_icon.svg'}
                            alt={educator.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                        />
                        <div>
                            <h1 className="text-3xl font-bold">{educator.name}</h1>
                            <p className="text-white/80 mt-1">{educator.email}</p>
                            <p className="text-white/80 mt-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                    {courses.length} published courses
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Courses by {educator.name}</h2>

                {courses.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <span className="text-4xl mb-4 block">📚</span>
                        <p className="text-gray-500">No courses published yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link to={`/Course/${course._id}`}>
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                        <img
                                            src={course.thumbnail || '/course_placeholder.png'}
                                            alt={course.courseTitle}
                                            className="w-full h-40 object-cover"
                                        />
                                        <div className="p-5">
                                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{course.courseTitle}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                                <span>📖 {calculateNoofLectures(course)} lessons</span>
                                                <span>•</span>
                                                <span>⏱️ {calculateCourseDuration(course)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < calculateRatings(course) ? 'text-yellow-400' : 'text-gray-300'}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-right">
                                                    {course.discount > 0 && (
                                                        <span className="text-gray-400 line-through text-sm mr-2">
                                                            ${course.coursePrice}
                                                        </span>
                                                    )}
                                                    <span className="text-purple-600 font-bold">
                                                        ${(course.coursePrice - (course.coursePrice * course.discount / 100)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EducatorCourses;
