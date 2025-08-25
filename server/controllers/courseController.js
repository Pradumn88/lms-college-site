import Course from "../models/course.js";
import User from "../models/user.js";

// 📌 Get all published courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "educator" });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📌 Get course by ID
export const getCourseId = async (req, res) => {
  const { id } = req.params;
  const userId = req.auth?.userId; // Clerk user ID is optional here

  try {
    const courseData = await Course.findById(id).populate({ path: "educator" });

    if (!courseData) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Check if the user is enrolled or is the educator for the course
    const isEnrolled = userId ? courseData.enrolledStudents.some(studentId => studentId.toString() === userId) : false;
    const isEducator = userId ? courseData.educator?._id.toString() === userId : false;

    // Hide non-preview lectures for users who are not enrolled and not the educator
    if (!isEnrolled && !isEducator) {
      courseData.courseContent.forEach((chapter) => {
        chapter.chapterContent.forEach((lecture) => {
          if (!lecture.isPreviewFree) {
            lecture.lectureUrl = ""; // or some placeholder
          }
        });
      });
    }

    res.json({ success: true, courseData });
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    res.json({ success: false, message: error.message });
  }
};

// 📌 Create a new course
export const createCourse = async (req, res) => {
  try {
    const educatorId = req.auth.userId;
    const course = new Course({ ...req.body, educator: educatorId });
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 📌 Update course
export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const educatorId = req.auth.userId;
  const updates = req.body;

  try {
    const course = await Course.findById(id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Security: Ensure the user updating the course is the one who created it
    if (course.educator.toString() !== educatorId) {
      return res
        .status(403)
        .json({ success: false, message: "User not authorized to update this course" });
    }

    // Apply updates and save
    Object.assign(course, updates);
    await course.save();

    res.json({ success: true, course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 📌 Delete course
export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 📌 Enroll in course
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.auth.userId; // Clerk user ID (string like "user_123")
    const { courseId } = req.params;

    console.log("➡️ Enroll attempt:", { userId, courseId });

    // Ensure user exists
    let user = await User.findById(userId);
    if (!user) {
      user = new User({
        _id: userId,
        name: req.auth.sessionClaims?.name || "Anonymous",
        email: req.auth.sessionClaims?.email || "",
        imageUrl: req.auth.sessionClaims?.image || "",
      });
      await user.save();
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // 🔑 Check by string, not ObjectId
    if (user.enrolledCourses.some((id) => id.toString() === courseId.toString())) {
      return res.json({ success: false, message: "Already enrolled" });
    }

    // Save both sides
    user.enrolledCourses.push(courseId);
    course.enrolledStudents.push(userId);

    await user.save();
    await course.save();

    console.log("✅ Enrolled successfully:", { userId, courseId });
    res.json({ success: true, message: "Enrolled successfully" });
  } catch (error) {
    console.error("❌ Enroll error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get my enrolled courses
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Ensure user exists in DB
    let user = await User.findById(userId).populate("enrolledCourses");
    if (!user) {
      user = new User({
        _id: userId,
        name: req.auth.sessionClaims?.name || "Anonymous",
        email: req.auth.sessionClaims?.email || "",
        imageUrl: req.auth.sessionClaims?.image || "",
      });
      await user.save();
      return res.json({ success: true, enrolledCourses: [] });
    }

    res.json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
