import express from 'express'
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourse, purchaseCourseStripe, purchaseCourseRazorpay, verifyRazorpayPayment, updateUserCourseProgress, userEnrolledCourses, getPaymentHistory, requestRefund, unenrollCourse, getEducators, getEducatorCoursesPublic, getStudentDashboard } from '../controllers/userController.js'
import { protectUser } from '../middlewares/authMiddleware.js'

const userRouter = express.Router()

// Public routes
userRouter.get('/educators', getEducators)
userRouter.get('/educators/:educatorId/courses', getEducatorCoursesPublic)

// Protected routes
userRouter.get('/data', protectUser, getUserData)
userRouter.get('/enrolled-courses', protectUser, userEnrolledCourses)
userRouter.get('/dashboard', protectUser, getStudentDashboard)
userRouter.get('/payment-history', protectUser, getPaymentHistory)

// Payment routes
userRouter.post('/purchase', protectUser, purchaseCourse)
userRouter.post('/purchase/stripe', protectUser, purchaseCourseStripe)
userRouter.post('/purchase/razorpay', protectUser, purchaseCourseRazorpay)
userRouter.post('/purchase/razorpay/verify', protectUser, verifyRazorpayPayment)

userRouter.post('/request-refund', protectUser, requestRefund)
userRouter.post('/unenroll', protectUser, unenrollCourse)

userRouter.post('/update-course-progress', protectUser, updateUserCourseProgress)
userRouter.post('/get-course-progress', protectUser, getUserCourseProgress)
userRouter.post('/add-rating', protectUser, addUserRating)

export default userRouter;