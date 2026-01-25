import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import OTP from '../models/OTP.js';
import { generateOTP, sendOTPEmail, sendWelcomeEmail } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Register User - Step 1: Send OTP
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role = 'student' } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Please provide all required fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser && existingUser.isEmailVerified) {
            return res.json({ success: false, message: 'User already exists with this email' });
        }

        // Delete unverified user with same email if exists
        if (existingUser && !existingUser.isEmailVerified) {
            await User.deleteOne({ _id: existingUser._id });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create unverified user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role === 'educator' ? 'educator' : 'student',
            isEmailVerified: false
        });

        // Generate and save OTP
        const otp = generateOTP();
        await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'registration' });
        await OTP.create({
            email: email.toLowerCase(),
            otp,
            purpose: 'registration'
        });

        // Send OTP email
        await sendOTPEmail(email, otp, 'registration');

        res.json({
            success: true,
            message: 'OTP sent to your email. Please verify to complete registration.',
            requiresVerification: true,
            email: email.toLowerCase()
        });

    } catch (error) {
        console.error('Register error:', error);

        // Handle MongoDB duplicate key error
        if (error.code === 11000 || error.message?.includes('duplicate key')) {
            return res.json({ success: false, message: 'User already exists with this email' });
        }

        res.json({ success: false, message: error.message });
    }
};

// Verify OTP and Complete Registration
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.json({ success: false, message: 'Please provide email and OTP' });
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            purpose: 'registration'
        });

        if (!otpRecord) {
            return res.json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
        }

        // Check attempts
        if (otpRecord.attempts >= 5) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.json({ success: false, message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.` });
        }

        // OTP verified - update user
        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { isEmailVerified: true },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: 'User not found. Please register again.' });
        }

        // Delete OTP record
        await OTP.deleteOne({ _id: otpRecord._id });

        // Send welcome email (async, don't wait)
        sendWelcomeEmail(email, user.name);

        // Generate token
        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            message: 'Email verified successfully!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                imageUrl: user.imageUrl,
                isEmailVerified: true
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Resend OTP
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: 'Please provide email' });
        }

        // Check if user exists and is not verified
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.json({ success: false, message: 'User not found. Please register first.' });
        }

        if (user.isEmailVerified) {
            return res.json({ success: false, message: 'Email already verified. Please login.' });
        }

        // Check rate limiting (1 OTP per minute)
        const recentOTP = await OTP.findOne({
            email: email.toLowerCase(),
            purpose: 'registration',
            createdAt: { $gt: new Date(Date.now() - 60000) } // Within last minute
        });

        if (recentOTP) {
            return res.json({ success: false, message: 'Please wait 1 minute before requesting a new OTP.' });
        }

        // Generate and save new OTP
        const otp = generateOTP();
        await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'registration' });
        await OTP.create({
            email: email.toLowerCase(),
            otp,
            purpose: 'registration'
        });

        // Send OTP email
        await sendOTPEmail(email, otp, 'registration');

        res.json({
            success: true,
            message: 'New OTP sent to your email.'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Please provide email and password' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            // Resend OTP
            const otp = generateOTP();
            await OTP.deleteMany({ email: email.toLowerCase(), purpose: 'registration' });
            await OTP.create({
                email: email.toLowerCase(),
                otp,
                purpose: 'registration'
            });
            await sendOTPEmail(email, otp, 'registration');

            return res.json({
                success: false,
                message: 'Email not verified. A new OTP has been sent.',
                requiresVerification: true,
                email: email.toLowerCase()
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                imageUrl: user.imageUrl,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password').populate('enrolledCourses');
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                imageUrl: user.imageUrl,
                enrolledCourses: user.enrolledCourses,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update User to Educator
export const becomeEducator = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.role === 'educator') {
            return res.json({ success: true, message: 'Already an educator' });
        }

        user.role = 'educator';
        await user.save();

        // Generate new token with updated role
        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            message: 'Congratulations! You are now an educator',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                imageUrl: user.imageUrl
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Verify Token
export const verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                imageUrl: user.imageUrl,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
