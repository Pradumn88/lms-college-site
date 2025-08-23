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

// Public routes
courseRouter.get("/all", getAllCourses);

// Auth routes
courseRouter.get("/my-enrollments", requireAuth(), getMyEnrollments);
courseRouter.get("/educator/courses", requireAuth(), getEducatorCourses);

courseRouter.post("/", createCourse);
courseRouter.put("/:id", updateCourse);
courseRouter.delete("/:id", deleteCourse);
courseRouter.post("/:courseId/enroll", requireAuth(), enrollCourse);

// Keep this last
courseRouter.get("/:id", getCourseId);

export default courseRouter;
