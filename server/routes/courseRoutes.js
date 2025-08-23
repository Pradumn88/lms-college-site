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

// ⚠️ Put specific routes BEFORE generic ones
courseRouter.get("/my-enrollments", requireAuth(), getMyEnrollments);
courseRouter.get("/educator/courses", requireAuth(), getEducatorCourses);

courseRouter.post("/", createCourse); // POST new course
courseRouter.put("/:id", updateCourse); // PUT update course
courseRouter.delete("/:id", deleteCourse); // DELETE course
courseRouter.post("/:courseId/enroll", requireAuth(), enrollCourse);

// Generic courseId route at the bottom ⬇️
courseRouter.get("/:id", getCourseId);

export default courseRouter;
