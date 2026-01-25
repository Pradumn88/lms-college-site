import express from 'express'
import {
  getAllCourses,
  getCourseId,
  createCourse,
  updateCourse,
  deleteCourse,
  submitReview,
  getReviews
} from '../controllers/courseController.js'
import { protectUser } from '../middlewares/authMiddleware.js'

const courseRouter = express.Router()

// Public routes
courseRouter.get('/all', getAllCourses)
courseRouter.get('/:id', getCourseId)
courseRouter.get('/:id/reviews', getReviews)

// Protected routes
courseRouter.post('/', protectUser, createCourse)
courseRouter.put('/:id', protectUser, updateCourse)
courseRouter.delete('/:id', protectUser, deleteCourse)
courseRouter.post('/:id/review', protectUser, submitReview)

export default courseRouter;