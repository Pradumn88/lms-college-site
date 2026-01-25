import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware (Protect user routes with JWT)
export const protectUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({ success: false, message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        req.userId = decoded.userId;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.json({ success: false, message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: 'Token expired' });
        }
        res.json({ success: false, message: error.message });
    }
};

// Middleware (Protect educator routes)
export const protectEducator = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({ success: false, message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== 'educator') {
            return res.json({ success: false, message: 'Unauthorized: Educator access required' });
        }

        req.userId = decoded.userId;
        req.userRole = decoded.role;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.json({ success: false, message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: 'Token expired' });
        }
        res.json({ success: false, message: error.message });
    }
};

// Middleware (Protect admin routes with JWT)
export const protectAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({ success: false, message: 'Admin authentication required' });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            return res.json({ success: false, message: 'Admin not found' });
        }

        req.admin = {
            id: admin._id,
            email: admin.email,
            name: admin.name
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.json({ success: false, message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: 'Token expired' });
        }
        res.json({ success: false, message: error.message });
    }
};