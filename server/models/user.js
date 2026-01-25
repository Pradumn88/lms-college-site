import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        imageUrl: { type: String, default: '/user_icon.svg' },
        role: { type: String, enum: ['student', 'educator'], default: 'student' },
        isEmailVerified: { type: Boolean, default: false },
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
    }, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User