import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [showPassword, setShowPassword] = useState(false);

    // OTP modal state
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    // Forgot password modal state
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [forgotOTP, setForgotOTP] = useState(['', '', '', '', '', '']);

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

    // Forgot password handlers
    const handleForgotPasswordSubmit = async () => {
        setForgotLoading(true);
        try {
            if (forgotPasswordStep === 1) {
                // Step 1: Send OTP
                const { data } = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
                    email: forgotEmail
                });
                if (data.success) {
                    toast.success('OTP sent to your email!');
                    setForgotPasswordStep(2);
                } else {
                    toast.error(data.message);
                }
            } else if (forgotPasswordStep === 2) {
                // Step 2: Verify OTP
                const otpCode = forgotOTP.join('');
                const { data } = await axios.post(`${API_BASE}/api/auth/verify-password-reset-otp`, {
                    email: forgotEmail,
                    otp: otpCode
                });
                if (data.success) {
                    toast.success('OTP verified!');
                    setResetToken(data.resetToken);
                    setForgotPasswordStep(3);
                } else {
                    toast.error(data.message);
                }
            } else if (forgotPasswordStep === 3) {
                // Step 3: Reset password
                if (newPassword !== confirmPassword) {
                    toast.error('Passwords do not match');
                    return;
                }
                if (newPassword.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    return;
                }
                const { data } = await axios.post(`${API_BASE}/api/auth/reset-password`, {
                    resetToken,
                    newPassword
                });
                if (data.success) {
                    toast.success('Password reset successful! You can now login.');
                    closeForgotPasswordModal();
                } else {
                    toast.error(data.message);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setForgotLoading(false);
        }
    };

    const closeForgotPasswordModal = () => {
        setShowForgotPasswordModal(false);
        setForgotPasswordStep(1);
        setForgotEmail('');
        setForgotOTP(['', '', '', '', '', '']);
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleForgotOTPChange = (value, index) => {
        if (!/^\d*$/.test(value)) return;
        const newOTP = [...forgotOTP];
        newOTP[index] = value.slice(-1);
        setForgotOTP(newOTP);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`forgot-otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleForgotOTPKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !forgotOTP[index] && index > 0) {
            const prevInput = document.getElementById(`forgot-otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    // Eye icon component
    const EyeIcon = ({ show, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
            {show ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )}
        </button>
    );

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
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        />
                                        <EyeIcon show={showPassword} onClick={() => setShowPassword(!showPassword)} />
                                    </div>
                                </div>

                                {/* Forgot Password Link */}
                                {!isRegister && (
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => setShowForgotPasswordModal(true)}
                                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

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

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {showForgotPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={closeForgotPasswordModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md"
                        >
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                                <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8">
                                    {/* Close button */}
                                    <button
                                        onClick={closeForgotPasswordModal}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    {/* Step indicator */}
                                    <div className="flex justify-center mb-6">
                                        <div className="flex items-center space-x-3">
                                            {[1, 2, 3].map((step) => (
                                                <React.Fragment key={step}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${forgotPasswordStep >= step
                                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                            : 'bg-slate-700 text-gray-400'
                                                        }`}>
                                                        {step}
                                                    </div>
                                                    {step < 3 && (
                                                        <div className={`w-8 h-1 rounded ${forgotPasswordStep > step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-700'
                                                            }`} />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Step 1: Email */}
                                    {forgotPasswordStep === 1 && (
                                        <div>
                                            <div className="text-center mb-6">
                                                <div className="text-4xl mb-3">🔐</div>
                                                <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                                                <p className="text-gray-400 text-sm">Enter your email to receive a reset OTP</p>
                                            </div>
                                            <input
                                                type="email"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all mb-6"
                                            />
                                        </div>
                                    )}

                                    {/* Step 2: OTP */}
                                    {forgotPasswordStep === 2 && (
                                        <div>
                                            <div className="text-center mb-6">
                                                <div className="text-4xl mb-3">📧</div>
                                                <h2 className="text-2xl font-bold text-white mb-2">Enter OTP</h2>
                                                <p className="text-gray-400 text-sm">We sent a 6-digit code to {forgotEmail}</p>
                                            </div>
                                            <div className="flex justify-center gap-2 mb-6">
                                                {forgotOTP.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        id={`forgot-otp-${index}`}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleForgotOTPChange(e.target.value, index)}
                                                        onKeyDown={(e) => handleForgotOTPKeyDown(e, index)}
                                                        className="w-11 h-14 text-center text-xl font-bold bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: New Password */}
                                    {forgotPasswordStep === 3 && (
                                        <div>
                                            <div className="text-center mb-6">
                                                <div className="text-4xl mb-3">🔑</div>
                                                <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
                                                <p className="text-gray-400 text-sm">Make sure it's at least 6 characters</p>
                                            </div>
                                            <div className="space-y-4 mb-6">
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? "text" : "password"}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        placeholder="New Password"
                                                        className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                    />
                                                    <EyeIcon show={showNewPassword} onClick={() => setShowNewPassword(!showNewPassword)} />
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        placeholder="Confirm Password"
                                                        className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                    />
                                                    <EyeIcon show={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                                                </div>
                                                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                                    <p className="text-red-400 text-sm">Passwords do not match</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit button */}
                                    <button
                                        onClick={handleForgotPasswordSubmit}
                                        disabled={forgotLoading ||
                                            (forgotPasswordStep === 1 && !forgotEmail) ||
                                            (forgotPasswordStep === 2 && forgotOTP.join('').length < 6) ||
                                            (forgotPasswordStep === 3 && (!newPassword || !confirmPassword))
                                        }
                                        className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {forgotLoading ? (
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            forgotPasswordStep === 1 ? 'Send OTP' :
                                                forgotPasswordStep === 2 ? 'Verify OTP' :
                                                    'Reset Password'
                                        )}
                                    </button>

                                    {/* Back link for steps 2 and 3 */}
                                    {forgotPasswordStep > 1 && (
                                        <button
                                            onClick={() => setForgotPasswordStep(forgotPasswordStep - 1)}
                                            className="w-full mt-4 text-gray-400 hover:text-white text-sm transition-colors"
                                        >
                                            ← Go Back
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Login;
