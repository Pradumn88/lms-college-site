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

// ⬅️ Import educator-specific controller
import { getEducatorCourses } from "../controllers/educatorController.js";

const courseRouter = express.Router();

// 📌 Public + Course CRUD
courseRouter.get("/all", getAllCourses);
courseRouter.get("/:id", getCourseId);
courseRouter.post("/", createCourse); // POST new course
courseRouter.put("/:id", updateCourse); // PUT update course
courseRouter.delete("/:id", deleteCourse); // DELETE course

// 📌 Enrollment routes
courseRouter.post("/:courseId/enroll", requireAuth(), enrollCourse);
courseRouter.get("/my-enrollments", requireAuth(), getMyEnrollments);

// 📌 Educator alias route (so frontend /api/course/educator/courses works)
courseRouter.get("/educator/courses", requireAuth(), getEducatorCourses);

export default courseRouter;

