import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AppContext } from '../../Context/AppContext.jsx';
import { AuthContext } from '../../Context/AuthContext.jsx';

const StudentDashboard = () => {
    const { backend, getToken } = useContext(AppContext);
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = getToken();
                const { data } = await axios.get(`${backend}/api/user/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setStats(data.dashboard);
                }
            } catch (error) {
                console.error('Error fetching dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const dashCards = [
        {
            title: 'Enrolled Courses',
            value: stats?.enrolledCourses || 0,
            icon: '📚',
            gradient: 'from-blue-500 to-cyan-500',
            link: '/my-enrollments'
        },
        {
            title: 'Total Spent',
            value: `$${stats?.totalSpent?.toFixed(2) || '0.00'}`,
            icon: '💳',
            gradient: 'from-green-500 to-emerald-500',
            link: '/payment-history'
        },
        {
            title: 'Lessons Completed',
            value: stats?.completedLectures || 0,
            icon: '✅',
            gradient: 'from-purple-500 to-pink-500',
            link: '/my-enrollments'
        },
        {
            title: 'Overall Progress',
            value: `${stats?.progressPercentage || 0}%`,
            icon: '📈',
            gradient: 'from-orange-500 to-red-500',
            link: '/my-enrollments'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
                    </h1>
                    <p className="text-gray-600 mt-2">Here's your learning progress overview</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashCards.map((card, index) => (
                        <Link key={card.title} to={card.link}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-1 cursor-pointer`}
                            >
                                <div className="bg-white rounded-2xl p-6 h-full">
                                    <div className="text-3xl mb-3">{card.icon}</div>
                                    <p className="text-gray-500 text-sm">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Actions Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link to="/Course-List" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                                <span className="text-xl">🔍</span>
                                <span className="text-gray-700">Browse Courses</span>
                            </Link>
                            <Link to="/my-enrollments" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                                <span className="text-xl">📖</span>
                                <span className="text-gray-700">Continue Learning</span>
                            </Link>
                            <Link to="/educators" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                                <span className="text-xl">👨‍🏫</span>
                                <span className="text-gray-700">Browse Educators</span>
                            </Link>
                            <Link to="/payment-history" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                                <span className="text-xl">💳</span>
                                <span className="text-gray-700">Payment History</span>
                            </Link>
                        </div>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Progress</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Overall Completion</span>
                                <span className="text-purple-600 font-semibold">{stats?.progressPercentage || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                                    style={{ width: `${stats?.progressPercentage || 0}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 mt-2">
                                <span>{stats?.completedLectures || 0} lessons completed</span>
                                <span>{stats?.totalLectures || 0} total lessons</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
