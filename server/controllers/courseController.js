import Course from "../models/course.js";
import User from "../models/user.js";

// 📌 get all courses (PUBLIC) → no enrolledStudents
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"]) // hide enrolledStudents for public
      .populate({ path: "educator" });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📌 get educator’s own courses (DASHBOARD) → includes enrolledStudents
export const getEducatorCourses = async (req, res) => {
  try {
    const educatorId = req.auth.userId; // Clerk userId
    const courses = await Course.find({ educator: educatorId })
      .select(["-courseContent"]) // keep enrolledStudents so educator can see
      .populate({ path: "educator" });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📌 get course by id
export const getCourseId = async (req, res) => {
  const { id } = req.params;

  try {
    const courseData = await Course.findById(id).populate({ path: "educator" });

    if (!courseData) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Hide lectureUrl if not free preview
    courseData.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });

    res.json({ success: true, courseData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📌 create a new course
export const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 📌 update a course
export const updateCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCourse = await Course.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 📌 delete a course
export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 📌 enroll in a course
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.auth.userId; // Clerk userId
    const { courseId } = req.params;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ success: false, message: "User or Course not found" });
    }

    // Prevent duplicate enrollment
    if (user.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: "Already enrolled" });
    }

    user.enrolledCourses.push(courseId);
    course.enrolledStudents.push(userId);

    await user.save();
    await course.save();

    res.json({ success: true, message: "Enrolled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 get my enrolled courses
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await User.findById(userId).populate("enrolledCourses");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
