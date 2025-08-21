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

const courseRouter = express.Router();

courseRouter.get("/all", getAllCourses);
courseRouter.get("/:id", getCourseId);
courseRouter.post("/", createCourse); // POST new course
courseRouter.put("/:id", updateCourse); // PUT update course
courseRouter.delete("/:id", deleteCourse); // DELETE course

// 📌 Enrollment routes
courseRouter.post("/:courseId/enroll", requireAuth(), enrollCourse);
courseRouter.get("/my-enrollments", requireAuth(), getMyEnrollments);

export default courseRouter;
