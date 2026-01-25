import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext.jsx';
import OTPVerificationModal from '../Components/OTPVerificationModal.jsx';

const Login = () => {
    const navigate = useNavigate();
    const { login, register, API_BASE } = useContext(AuthContext);

    const [activeRole, setActiveRole] = useState(null); // 'student', 'educator', 'admin'
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    // OTP modal state
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    const roles = [
        {
            id: 'student',
            title: 'Student',
            description: 'Access courses, track your progress, and learn new skills',
            icon: '🎓',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'educator',
            title: 'Educator',
            description: 'Create and manage courses, track student enrollments',
            icon: '👨‍🏫',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            id: 'admin',
            title: 'Admin',
            description: 'Full system control - manage users, courses, and transactions',
            icon: '🛡️',
            gradient: 'from-orange-500 to-red-500'
        }
    ];

    const handleRoleSelect = (roleId) => {
        if (roleId === 'admin') {
            navigate('/admin-login');
        } else {
            setActiveRole(roleId);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegister) {
                const result = await register(formData.name, formData.email, formData.password, activeRole);

                if (result.success && result.requiresVerification) {
                    // Show OTP modal
                    setPendingEmail(result.email || formData.email);
                    setShowOTPModal(true);
                    toast.info('OTP sent to your email!');
                } else if (result.success) {
                    toast.success('Registration successful!');
                    navigate(activeRole === 'educator' ? '/educator' : '/');
                } else {
                    toast.error(result.message);
                }
            } else {
                const result = await login(formData.email, formData.password);

                if (result.success) {
                    toast.success('Login successful!');
                    if (result.user?.role === 'educator') {
                        navigate('/educator');
                    } else {
                        navigate('/');
                    }
                } else if (result.requiresVerification) {
                    // Email not verified - show OTP modal
                    setPendingEmail(result.email || formData.email);
                    setShowOTPModal(true);
                    toast.info('Please verify your email. OTP sent!');
                } else {
                    toast.error(result.message);
                }
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerify = async (otp) => {
        const { data } = await axios.post(`${API_BASE}/api/auth/verify-otp`, {
            email: pendingEmail,
            otp
        });

        if (data.success) {
            toast.success('Email verified successfully!');
            // Auto-login after verification
            localStorage.setItem('token', data.token);
            setShowOTPModal(false);

            if (data.user?.role === 'educator') {
                navigate('/educator');
            } else {
                navigate('/');
            }
            // Force page reload to update auth state
            window.location.reload();
        } else {
            throw new Error(data.message);
        }
    };

    const handleResendOTP = async () => {
        const { data } = await axios.post(`${API_BASE}/api/auth/resend-otp`, {
            email: pendingEmail
        });

        if (data.success) {
            toast.success('New OTP sent!');
        } else {
            throw new Error(data.message);
        }
    };

    const handleBack = () => {
        setActiveRole(null);
        setIsRegister(false);
        setFormData({ name: '', email: '', password: '' });
    };

    // Show role selection
    if (!activeRole) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
                <div className="max-w-5xl w-full">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-white to-cyan-200 mb-4">
                            Welcome to AIM
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl">
                            Choose your role to continue
                        </p>
                    </motion.div>

                    {/* Role Cards */}
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {roles.map((role, index) => (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleRoleSelect(role.id)}
                                className="cursor-pointer"
                            >
                                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${role.gradient} p-1`}>
                                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 h-full">
                                        <div className="text-6xl mb-6 text-center">{role.icon}</div>
                                        <h2 className="text-2xl font-bold text-white text-center mb-3">{role.title}</h2>
                                        <p className="text-gray-400 text-center text-sm leading-relaxed">{role.description}</p>
                                        <div className={`mt-6 py-3 px-6 rounded-xl bg-gradient-to-r ${role.gradient} text-white font-semibold text-center`}>
                                            Continue as {role.title}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Back to Home */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-10"
                    >
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-400 hover:text-white transition-colors duration-300"
                        >
                            ← Back to Home
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Show login/register form
    const currentRole = roles.find(r => r.id === activeRole);

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentRole.gradient} p-1`}>
                        <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="text-5xl mb-4">{currentRole.icon}</div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {isRegister ? 'Create Account' : 'Welcome Back'}
                                </h1>
                                <p className="text-gray-400 text-sm">
                                    {isRegister ? `Register as ${currentRole.title}` : `Login as ${currentRole.title}`}
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {isRegister && (
                                    <div>
                                        <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            required
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="you@example.com"
                                        required
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 px-6 bg-gradient-to-r ${currentRole.gradient} text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        isRegister ? 'Create Account' : 'Sign In'
                                    )}
                                </button>
                            </form>

                            {/* Toggle Register/Login */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setIsRegister(!isRegister)}
                                    className="text-gray-400 hover:text-white text-sm transition-colors"
                                >
                                    {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                                </button>
                            </div>

                            {/* Back Link */}
                            <div className="mt-4 text-center">
                                <button
                                    onClick={handleBack}
                                    className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                                >
                                    ← Choose Different Role
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* OTP Verification Modal */}
            <OTPVerificationModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                email={pendingEmail}
                onVerify={handleOTPVerify}
                onResend={handleResendOTP}
            />
        </>
    );
};

export default Login;
