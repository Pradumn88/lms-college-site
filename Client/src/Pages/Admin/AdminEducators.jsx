import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminContext } from '../../Context/AdminContext.jsx';

const AdminEducators = () => {
    const { educators, fetchEducators, removeEducator } = useContext(AdminContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            await fetchEducators();
            setLoading(false);
        };
        load();
    }, []);

    const filteredEducators = educators.filter(edu =>
        edu.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        edu.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRemove = (educatorId, name) => {
        if (window.confirm(`Are you sure you want to remove educator "${name}"? This will revoke their educator privileges.`)) {
            removeEducator(educatorId);
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
                    <h1 className="text-3xl font-bold text-white mb-2">Educators</h1>
                    <p className="text-gray-400">Manage all educators on your platform</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search educators..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                </div>
            </div>

            {/* Educators Grid */}
            {filteredEducators.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <span className="text-4xl mb-4 block">👨‍🏫</span>
                    <p className="text-gray-400">No educators found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEducators.map((educator, index) => (
                        <motion.div
                            key={educator.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <img
                                    src={educator.imageUrl || '/user_icon.svg'}
                                    alt={educator.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/30"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold truncate">{educator.name}</h3>
                                    <p className="text-gray-400 text-sm truncate">{educator.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                            {educator.courseCount} courses
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-2">
                                <button
                                    onClick={() => handleRemove(educator.id, educator.name)}
                                    className="flex-1 py-2 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/30 transition-all"
                                >
                                    Remove Educator
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminEducators;
