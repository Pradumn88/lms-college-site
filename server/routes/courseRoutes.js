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

// Educator-specific controller
import { getEducatorCourses } from "../controllers/educatorController.js";

const courseRouter = express.Router();

// 📌 Public + CRUD
courseRouter.get("/all", getAllCourses);
courseRouter.get("/:id", getCourseId);
courseRouter.post("/", createCourse);
courseRouter.put("/:id", updateCourse);
courseRouter.delete("/:id", deleteCourse);

// 📌 Enrollment
courseRouter.post("/:courseId/enroll", requireAuth(), enrollCourse);
courseRouter.get("/my-enrollments", requireAuth(), getMyEnrollments);

// 📌 Educator courses
courseRouter.get("/educator/courses", requireAuth(), getEducatorCourses);

export default courseRouter;
