import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminContext } from '../../Context/AdminContext.jsx';

const AdminNavbar = () => {
    const { adminData, adminLogout } = useContext(AdminContext);
    const location = useLocation();

    return (
        <div className="flex items-center justify-between px-6 md:px-12 py-4 shadow-lg bg-gradient-to-r from-slate-900 via-red-900 to-slate-900 border-b border-red-800/30">
            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-3">
                <motion.h1
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 drop-shadow-lg"
                >
                    AIM
                </motion.h1>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-md border border-red-500/30">
                    ADMIN
                </span>
            </Link>

            {/* Right Section */}
            <div className="flex items-center gap-4 text-white">
                <div className="hidden md:flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">
                        {adminData?.name || 'Admin'}
                    </span>
                </div>
                <button
                    onClick={adminLogout}
                    className="px-4 py-2 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminNavbar;
