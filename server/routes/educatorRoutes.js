import express from 'express';
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateCourse, deleteCourse, getCourseStudents, getPurchaseLogs } from '../controllers/educatorController.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

// Course management
educatorRouter.post('/add-course', protectEducator, addCourse)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)
educatorRouter.put('/courses/:courseId', protectEducator, updateCourse)
educatorRouter.delete('/courses/:courseId', protectEducator, deleteCourse)
educatorRouter.get('/courses/:courseId/students', protectEducator, getCourseStudents)

// Dashboard and analytics
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)
educatorRouter.get('/purchase-logs', protectEducator, getPurchaseLogs)

export default educatorRouter;
