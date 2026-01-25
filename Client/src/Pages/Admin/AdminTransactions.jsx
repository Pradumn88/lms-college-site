import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminContext } from '../../Context/AdminContext.jsx';

const AdminTransactions = () => {
    const { transactions, fetchTransactions } = useContext(AdminContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            await fetchTransactions();
            setLoading(false);
        };
        load();
    }, []);

    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch =
            txn.userInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.userInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.courseName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalRevenue = transactions
        .filter(t => t.status === 'Completed')
        .reduce((sum, t) => sum + t.amount, 0);

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
                    <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
                    <p className="text-gray-400">View all payment transactions and history</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                        <option value="all">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-48 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-gray-400 text-sm">Total Transactions</p>
                    <p className="text-white text-2xl font-bold">{transactions.length}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-gray-400 text-sm">Completed</p>
                    <p className="text-green-400 text-2xl font-bold">
                        {transactions.filter(t => t.status === 'Completed').length}
                    </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-green-400 text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                </div>
            </div>

            {/* Transactions Table */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <span className="text-4xl mb-4 block">💳</span>
                    <p className="text-gray-400">No transactions found</p>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Date</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Customer</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Course</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Amount</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((txn, index) => (
                                    <motion.tr
                                        key={txn._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="border-t border-slate-700/50 hover:bg-slate-700/30"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white text-sm">{new Date(txn.createdAt).toLocaleDateString()}</p>
                                                <p className="text-gray-500 text-xs">{new Date(txn.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white text-sm">{txn.userInfo?.name || 'Unknown'}</p>
                                                <p className="text-gray-500 text-xs">{txn.userInfo?.email || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-300 text-sm">{txn.courseName || 'Deleted Course'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-400 font-medium">${txn.amount?.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${txn.status === 'Completed'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : txn.status === 'Pending'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {txn.status}
                                            </span>
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

export default AdminTransactions;
