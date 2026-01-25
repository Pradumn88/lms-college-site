import React, { useContext, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminNavbar from '../../Components/Admin/AdminNavbar.jsx';
import AdminSidebar from '../../Components/Admin/AdminSidebar.jsx';
import { AdminContext } from '../../Context/AdminContext.jsx';

const Admin = () => {
    const { isAdminAuth, loading, fetchDashboardStats } = useContext(AdminContext);

    useEffect(() => {
        if (isAdminAuth) {
            fetchDashboardStats();
        }
    }, [isAdminAuth]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAdminAuth) {
        return <Navigate to="/admin-login" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <AdminNavbar />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Admin;
