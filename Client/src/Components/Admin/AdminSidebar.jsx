import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminContext } from '../../Context/AdminContext.jsx';

const AdminSidebar = () => {
    const { dashboardStats } = useContext(AdminContext);

    const menuItems = [
        {
            path: '/admin',
            icon: '📊',
            label: 'Dashboard',
            exact: true
        },
        {
            path: '/admin/educators',
            icon: '👨‍🏫',
            label: 'Educators',
            count: dashboardStats?.totalEducators
        },
        {
            path: '/admin/courses',
            icon: '📚',
            label: 'Courses',
            count: dashboardStats?.totalCourses
        },
        {
            path: '/admin/students',
            icon: '🎓',
            label: 'Students',
            count: dashboardStats?.totalStudents
        },
        {
            path: '/admin/transactions',
            icon: '💳',
            label: 'Transactions',
            count: dashboardStats?.totalTransactions
        }
    ];

    return (
        <div className="w-64 min-h-screen bg-slate-900 border-r border-slate-700/50 p-4">
            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => `
                            flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                            ${isActive
                                ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30'
                                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </div>
                        {item.count !== undefined && (
                            <span className="px-2 py-0.5 bg-slate-700 text-gray-300 text-xs rounded-full">
                                {item.count}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Stats Summary */}
            {dashboardStats && (
                <div className="mt-8 p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20">
                    <h3 className="text-gray-400 text-xs font-semibold uppercase mb-3">Quick Stats</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Revenue</span>
                            <span className="text-green-400 font-medium">
                                ${dashboardStats.totalRevenue?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSidebar;
