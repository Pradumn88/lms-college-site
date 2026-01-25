import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminContext } from '../../Context/AdminContext.jsx';

const AdminDashboard = () => {
    const { dashboardStats, fetchDashboardStats } = useContext(AdminContext);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const statCards = [
        {
            title: 'Total Students',
            value: dashboardStats?.totalStudents || 0,
            icon: '🎓',
            gradient: 'from-blue-500 to-cyan-500',
            change: '+12%'
        },
        {
            title: 'Total Educators',
            value: dashboardStats?.totalEducators || 0,
            icon: '👨‍🏫',
            gradient: 'from-purple-500 to-pink-500',
            change: '+5%'
        },
        {
            title: 'Total Courses',
            value: dashboardStats?.totalCourses || 0,
            icon: '📚',
            gradient: 'from-orange-500 to-red-500',
            change: '+8%'
        },
        {
            title: 'Total Revenue',
            value: `$${dashboardStats?.totalRevenue?.toFixed(2) || '0.00'}`,
            icon: '💰',
            gradient: 'from-green-500 to-emerald-500',
            change: '+18%'
        }
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-gray-400">Welcome back! Here's what's happening with your platform.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-1`}
                    >
                        <div className="bg-slate-900/90 backdrop-blur rounded-2xl p-6 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl">{card.icon}</span>
                                <span className="text-green-400 text-sm font-medium">{card.change}</span>
                            </div>
                            <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
                            <p className="text-white text-3xl font-bold">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <a
                            href="/admin/educators"
                            className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all text-gray-300 hover:text-white"
                        >
                            <span className="text-xl">👨‍🏫</span>
                            <span>Manage Educators</span>
                        </a>
                        <a
                            href="/admin/courses"
                            className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all text-gray-300 hover:text-white"
                        >
                            <span className="text-xl">📚</span>
                            <span>Manage Courses</span>
                        </a>
                        <a
                            href="/admin/students"
                            className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all text-gray-300 hover:text-white"
                        >
                            <span className="text-xl">🎓</span>
                            <span>View Students</span>
                        </a>
                        <a
                            href="/admin/transactions"
                            className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all text-gray-300 hover:text-white"
                        >
                            <span className="text-xl">💳</span>
                            <span>View Transactions</span>
                        </a>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">System Overview</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                            <span className="text-gray-400">Total Transactions</span>
                            <span className="text-white font-medium">{dashboardStats?.totalTransactions || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                            <span className="text-gray-400">Platform Status</span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="text-green-400 font-medium">Active</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-400">Last Updated</span>
                            <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
