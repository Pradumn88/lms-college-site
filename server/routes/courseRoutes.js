import express from "express";
import {
  getAllCourses,
  getCourseId,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyEnrollments,
} from "../controllers/courseController.js";
import { requireAuth } from "@clerk/express";
import { getEducatorCourses } from "../controllers/educatorController.js";

const courseRouter = express.Router();

/**
 * 📌 Order of routes matters!
 * - Specific routes FIRST
 * - Generic (/:id) LAST
 */

// ✅ Public: Fetch all courses
courseRouter.get("/all", getAllCourses);

// ✅ Enrollment routes (protected)
courseRouter.get("/my-enrollments", requireAuth(), getMyEnrollments);
courseRouter.post("/:courseId/enroll", requireAuth(), enrollCourse);

// ✅ Educator-specific routes (protected)
courseRouter.get("/educator/courses", requireAuth(), getEducatorCourses);

// ✅ Course CRUD (create/update/delete)
courseRouter.post("/", createCourse);
courseRouter.put("/:id", updateCourse);
courseRouter.delete("/:id", deleteCourse);

// ✅ Must be LAST: fetch course by ID
courseRouter.get("/:id", getCourseId);

export default courseRouter;
