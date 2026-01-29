import express from 'express';
import {
    registerUser,
    loginUser,
    getCurrentUser,
    becomeEducator,
    verifyToken,
    verifyOTP,
    resendOTP,
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword
} from '../controllers/authController.js';
import { protectUser } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

// Public routes
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/resend-otp', resendOTP);

// Forgot password routes
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/verify-password-reset-otp', verifyPasswordResetOTP);
authRouter.post('/reset-password', resetPassword);

// Protected routes
authRouter.get('/me', protectUser, getCurrentUser);
authRouter.get('/verify', protectUser, verifyToken);
authRouter.post('/become-educator', protectUser, becomeEducator);

export default authRouter;
