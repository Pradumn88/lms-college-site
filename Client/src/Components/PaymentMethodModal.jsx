import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentMethodModal = ({ isOpen, onClose, course, onSelectMethod, loading }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);

    if (!isOpen) return null;

    const paymentMethods = [
        {
            id: 'razorpay',
            name: 'Razorpay',
            description: 'Pay with UPI, Cards, Netbanking',
            icon: '🏦',
            color: 'from-blue-500 to-blue-600'
        },
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'Pay with international cards',
            icon: '💳',
            color: 'from-purple-500 to-indigo-600'
        }
    ];

    const handleProceed = () => {
        if (selectedMethod) {
            onSelectMethod(selectedMethod);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Choose Payment Method</h2>
                        <p className="text-gray-500 text-sm mt-1">Select how you'd like to pay</p>
                    </div>

                    {/* Course Info */}
                    {course && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-4">
                            <img
                                src={course.thumbnail || '/course_placeholder.png'}
                                alt={course.title}
                                className="w-16 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-800 line-clamp-1">{course.title}</p>
                                <p className="text-purple-600 font-bold">${course.finalAmount?.toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    {/* Payment Options */}
                    <div className="space-y-3 mb-6">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${selectedMethod === method.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-2xl`}>
                                        {method.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{method.name}</p>
                                        <p className="text-gray-500 text-sm">{method.description}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 ${selectedMethod === method.id
                                            ? 'border-purple-500 bg-purple-500'
                                            : 'border-gray-300'
                                        } flex items-center justify-center`}>
                                        {selectedMethod === method.id && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleProceed}
                            disabled={!selectedMethod || loading}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Proceed to Pay'
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PaymentMethodModal;
