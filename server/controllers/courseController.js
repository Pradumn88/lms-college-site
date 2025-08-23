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

  try {
    const courseData = await Course.findById(id).populate({ path: "educator" });

    if (!courseData) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Hide non-preview lectures
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

// 📌 Create course
export const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// 📌 Update course
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

// 📌 Delete course
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

// 📌 Enroll in course
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.auth.userId; // Clerk string ID
    const { courseId } = req.params;

    console.log("➡️ Enroll request:", { userId, courseId });

    // Ensure user exists in DB (auto-create if missing)
    let user = await User.findById(userId);
    if (!user) {
      user = new User({
        _id: userId,
        name: req.auth.sessionClaims?.name || "Anonymous",
        email: req.auth.sessionClaims?.email || "",
        imageUrl: req.auth.sessionClaims?.image || "",
      });
      await user.save();
      console.log("✅ User created:", user);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Prevent duplicate enrollment
    if (user.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: "Already enrolled" });
    }

    user.enrolledCourses.push(courseId);
    course.enrolledStudents.push(userId);

    await user.save();
    await course.save();

    console.log("✅ Enrollment saved. User:", userId, "Course:", courseId);

    res.json({ success: true, message: "Enrolled successfully" });
  } catch (error) {
    console.error("❌ Enroll error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get my enrollments
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log("➡️ Fetching enrollments for user:", userId);

    let user = await User.findById(userId).populate("enrolledCourses");
    if (!user) {
      user = new User({
        _id: userId,
        name: req.auth.sessionClaims?.name || "Anonymous",
        email: req.auth.sessionClaims?.email || "",
        imageUrl: req.auth.sessionClaims?.image || "",
      });
      await user.save();
      console.log("⚠️ User did not exist, created new:", userId);
      return res.json({ success: true, enrolledCourses: [] });
    }

    console.log("✅ Enrolled courses fetched:", user.enrolledCourses.length);

    res.json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    console.error("❌ getMyEnrollments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
