import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    paymentMethod: { type: String, enum: ['stripe', 'razorpay'], default: 'stripe' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    stripeSessionId: { type: String }
}, { timestamps: true });

export const Purchase = mongoose.model('Purchase', PurchaseSchema)