import express from 'express';
import {
    registerUser,
    loginUser,
    getCurrentUser,
    becomeEducator,
    verifyToken,
    verifyOTP,
    resendOTP
} from '../controllers/authController.js';
import { protectUser } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

// Public routes
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/resend-otp', resendOTP);

// Protected routes
authRouter.get('/me', protectUser, getCurrentUser);
authRouter.get('/verify', protectUser, verifyToken);
authRouter.post('/become-educator', protectUser, becomeEducator);

export default authRouter;
