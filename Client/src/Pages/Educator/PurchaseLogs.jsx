import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../Context/AppContext.jsx';

const PurchaseLogs = () => {
    const { backend, getToken } = useContext(AppContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchLogs = async () => {
        try {
            const token = getToken();
            const { data } = await axios.get(`${backend}/api/educator/purchase-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setLogs(data.purchaseLogs);
            }
        } catch (error) {
            toast.error('Failed to fetch purchase logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.status === filter;
    });

    const stats = {
        total: logs.length,
        completed: logs.filter(l => l.status === 'Completed').length,
        pending: logs.filter(l => l.status === 'Pending').length,
        failed: logs.filter(l => l.status === 'Failed').length,
        revenue: logs.filter(l => l.status === 'Completed').reduce((sum, l) => sum + l.amount, 0)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Purchase Logs</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-gray-500 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-gray-500 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-gray-500 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-gray-500 text-sm">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                    <p className="text-gray-500 text-sm">Revenue</p>
                    <p className="text-2xl font-bold text-purple-600">${stats.revenue.toFixed(2)}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4">
                {['all', 'Completed', 'Pending', 'Failed'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all' ? 'All' : f}
                    </button>
                ))}
            </div>

            {/* Logs Table */}
            {filteredLogs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No purchase logs found</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left text-gray-600 text-sm font-medium px-6 py-4">Date</th>
                                <th className="text-left text-gray-600 text-sm font-medium px-6 py-4">Student</th>
                                <th className="text-left text-gray-600 text-sm font-medium px-6 py-4">Course</th>
                                <th className="text-left text-gray-600 text-sm font-medium px-6 py-4">Amount</th>
                                <th className="text-left text-gray-600 text-sm font-medium px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, index) => (
                                <motion.tr
                                    key={log._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-gray-800 text-sm">{new Date(log.createdAt).toLocaleDateString()}</p>
                                            <p className="text-gray-500 text-xs">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={log.user?.imageUrl || '/user_icon.svg'}
                                                alt=""
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="text-gray-800 text-sm font-medium">{log.user?.name || 'Unknown'}</p>
                                                <p className="text-gray-500 text-xs">{log.user?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-800 text-sm">{log.course?.courseTitle || 'Deleted'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-800 font-medium">${log.amount?.toFixed(2)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${log.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                log.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PurchaseLogs;
