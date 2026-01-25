import express from 'express';
import {
    loginAdmin,
    verifyAdmin,
    getAllEducators,
    removeEducator,
    getAllCoursesAdmin,
    updateCourseAdmin,
    deleteCourseAdmin,
    toggleCoursePublish,
    getAllStudents,
    getStudentDetails,
    removeStudent,
    getAllTransactions,
    getDashboardStats
} from '../controllers/adminController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const adminRouter = express.Router();

// Public routes
adminRouter.post('/login', loginAdmin);

// Protected routes (require admin token)
adminRouter.get('/verify', protectAdmin, verifyAdmin);
adminRouter.get('/dashboard', protectAdmin, getDashboardStats);

// Educator management
adminRouter.get('/educators', protectAdmin, getAllEducators);
adminRouter.delete('/educators/:educatorId', protectAdmin, removeEducator);

// Course management
adminRouter.get('/courses', protectAdmin, getAllCoursesAdmin);
adminRouter.put('/courses/:courseId', protectAdmin, updateCourseAdmin);
adminRouter.delete('/courses/:courseId', protectAdmin, deleteCourseAdmin);
adminRouter.patch('/courses/:courseId/toggle-publish', protectAdmin, toggleCoursePublish);

// Student management
adminRouter.get('/students', protectAdmin, getAllStudents);
adminRouter.get('/students/:studentId', protectAdmin, getStudentDetails);
adminRouter.delete('/students/:studentId', protectAdmin, removeStudent);

// Transactions
adminRouter.get('/transactions', protectAdmin, getAllTransactions);

export default adminRouter;
