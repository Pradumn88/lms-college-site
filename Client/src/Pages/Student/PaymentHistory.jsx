import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../Context/AppContext.jsx';
import Footer from '../../Components/Student/Footer';

const PaymentHistory = () => {
    const { backend, getToken, currency, navigate } = useContext(AppContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = getToken();
                const { data } = await axios.get(`${backend}/api/user/payment-history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    setHistory(data.paymentHistory);
                }
            } catch (error) {
                toast.error('Failed to fetch payment history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const totalSpent = history.filter(h => h.status === 'Completed').reduce((sum, h) => sum + h.amount, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="max-w-5xl mx-auto px-4 py-24">
                <h1 className="text-4xl font-bold text-white mb-2">Payment History</h1>
                <p className="text-gray-400 mb-8">View all your transactions and purchases</p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
                        <p className="text-3xl font-bold text-white">{history.length}</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-1">Completed</p>
                        <p className="text-3xl font-bold text-green-400">{history.filter(h => h.status === 'Completed').length}</p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm mb-1">Total Spent</p>
                        <p className="text-3xl font-bold text-purple-400">{currency}{totalSpent.toFixed(2)}</p>
                    </div>
                </div>

                {/* History Table */}
                {history.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl">
                        <span className="text-6xl mb-4 block">💳</span>
                        <p className="text-gray-400 text-xl">No payment history found</p>
                        <button onClick={() => navigate('/Course-List')} className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl">
                            Browse Courses
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-900/50 border-b border-white/10">
                                <tr>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Date</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Course</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Amount</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, index) => (
                                    <motion.tr
                                        key={item._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-t border-white/5 hover:bg-white/5"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="text-gray-300 text-sm">{new Date(item.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.course?.thumbnail || '/course_placeholder.png'} alt="" className="w-12 h-8 rounded object-cover" />
                                                <span className="text-white text-sm">{item.course?.courseTitle || 'Deleted Course'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-medium">{currency}{item.amount?.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block w-fit ${item.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                                        item.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                                {item.refundStatus && (
                                                    <span className={`px-2 py-0.5 rounded text-xs ${item.refundStatus === 'Approved' ? 'bg-blue-500/20 text-blue-400' :
                                                            item.refundStatus === 'Pending' ? 'bg-orange-500/20 text-orange-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        Refund: {item.refundStatus}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default PaymentHistory;
