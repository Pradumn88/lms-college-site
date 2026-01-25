import React, { useState, useRef, useEffect } from 'react';

const OTPVerificationModal = ({ isOpen, onClose, email, onVerify, onResend }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (isOpen) {
            setOtp(['', '', '', '', '', '']);
            setError('');
            setTimer(60);
            setCanResend(false);
            inputRefs.current[0]?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        let interval;
        if (isOpen && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isOpen, timer]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onVerify(otpString);
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setResendLoading(true);
        try {
            await onResend();
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✉️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
                    <p className="text-white/80 mt-2 text-sm">
                        We've sent a 6-digit code to
                    </p>
                    <p className="text-white font-semibold">{email}</p>
                </div>

                {/* OTP Input */}
                <div className="p-6">
                    <div className="flex justify-center gap-2 mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg 
                         focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none 
                         transition-all duration-200"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-center mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleVerify}
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold 
                     rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Verifying...
                            </>
                        ) : (
                            'Verify Email'
                        )}
                    </button>

                    {/* Resend Timer */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Didn't receive the code?
                        </p>
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="mt-2 text-purple-600 font-semibold hover:underline disabled:opacity-50"
                            >
                                {resendLoading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        ) : (
                            <p className="mt-2 text-gray-400">
                                Resend in <span className="font-semibold text-purple-600">{timer}s</span>
                            </p>
                        )}
                    </div>

                    {/* Cancel */}
                    <button
                        onClick={onClose}
                        className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};

export default OTPVerificationModal;
