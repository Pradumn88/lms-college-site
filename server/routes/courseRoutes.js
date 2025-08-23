import express from "express";
import {
  getAllCourses,
  getCourseId,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getMyEnrollments,
  getEducatorCourses,   // ✅ import from courseController.js, not educatorController.js
} from "../controllers/courseController.js";
import { requireAuth } from "@clerk/express";

const courseRouter = express.Router();

// 📌 Public + Course CRUD
courseRouter.get("/all", getAllCourses);
courseRouter.get("/:id", getCourseId);
courseRouter.post("/", createCourse);
courseRouter.put("/:id", updateCourse);
courseRouter.delete("/:id", deleteCourse);

// 📌 Enrollment routes
courseRouter.post("/:courseId/enroll", requireAuth(), enrollCourse);
courseRouter.get("/my-enrollments", requireAuth(), getMyEnrollments);

// 📌 Educator’s courses (frontend expects this endpoint)
courseRouter.get("/educator/courses", requireAuth(), getEducatorCourses);

export default courseRouter;
