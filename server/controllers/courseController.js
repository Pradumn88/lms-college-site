// import Course from "../models/course.js";
// import User from "../models/user.js";
// import mongoose from "mongoose";

// // Helper to safely get educator info
// const getEducatorInfo = async (educatorId) => {
//   try {
//     // Check if it's a valid MongoDB ObjectId
//     if (mongoose.Types.ObjectId.isValid(educatorId)) {
//       const educator = await User.findById(educatorId).select('name email imageUrl');
//       if (educator) return educator;
//     }
//     // Return a placeholder for legacy Clerk IDs
//     return { name: 'Unknown Educator', email: '', imageUrl: '' };
//   } catch (error) {
//     return { name: 'Unknown Educator', email: '', imageUrl: '' };
//   }
// };

// // Get all courses
// export const getAllCourses = async (req, res) => {
//   try {
//     const courses = await Course.find({ isPublished: true })
//       .select(["-courseContent", "-enrolledStudents"])
//       .lean();

//     // Manually populate educator info to handle legacy Clerk IDs
//     const coursesWithEducator = await Promise.all(
//       courses.map(async (course) => {
//         const educator = await getEducatorInfo(course.educator);
//         return { ...course, educator };
//       })
//     );

//     res.json({ success: true, courses: coursesWithEducator });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // Get course by ID
// export const getCourseId = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const courseData = await Course.findById(id).lean();

//     if (!courseData) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     // Manually populate educator info to handle legacy Clerk IDs
//     courseData.educator = await getEducatorInfo(courseData.educator);

//     // Remove lectureUrl if isPreviewFree is false
//     if (courseData.courseContent) {
//       courseData.courseContent.forEach((chapter) => {
//         chapter.chapterContent.forEach((lecture) => {
//           if (!lecture.isPreviewFree) {
//             lecture.lectureUrl = "";
//           }
//         });
//       });
//     }

//     res.json({ success: true, courseData });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// // Create a new course
// export const createCourse = async (req, res) => {
//   try {
//     const course = new Course(req.body);
//     await course.save();
//     res.status(201).json({ success: true, course });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Update an existing course by ID
// export const updateCourse = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedCourse = await Course.findByIdAndUpdate(
//       id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );

//     if (!updatedCourse) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     res.json({ success: true, course: updatedCourse });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Delete a course by ID
// export const deleteCourse = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedCourse = await Course.findByIdAndDelete(id);
//     if (!deletedCourse) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }
//     res.json({ success: true, message: "Course deleted successfully" });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Submit a review for a course
// export const submitReview = async (req, res) => {
//   const { id } = req.params;
//   const { rating, comment } = req.body;
//   const userId = req.userId;

//   try {
//     if (!rating || rating < 1 || rating > 5) {
//       return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
//     }

//     const course = await Course.findById(id);
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     // Check if user is enrolled
//     if (!course.enrolledStudents.includes(userId)) {
//       return res.status(403).json({ success: false, message: "You must be enrolled to review this course" });
//     }

//     // Get user name
//     const user = await User.findById(userId);
//     const userName = user?.name || "Anonymous";

//     // Check if user already reviewed
//     const existingReviewIndex = course.courseRatings.findIndex(r => r.userId === userId);

//     if (existingReviewIndex >= 0) {
//       // Update existing review
//       course.courseRatings[existingReviewIndex].rating = rating;
//       course.courseRatings[existingReviewIndex].comment = comment || "";
//       course.courseRatings[existingReviewIndex].createdAt = new Date();
//     } else {
//       // Add new review
//       course.courseRatings.push({
//         userId,
//         userName,
//         rating,
//         comment: comment || "",
//         createdAt: new Date()
//       });
//     }

//     await course.save();
//     res.json({ success: true, message: "Review submitted successfully" });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Get all reviews for a course
// export const getReviews = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const course = await Course.findById(id).select('courseRatings');
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     // Sort by newest first
//     const reviews = course.courseRatings
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     // Calculate average rating
//     const avgRating = reviews.length > 0
//       ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
//       : 0;

//     res.json({
//       success: true,
//       reviews,
//       stats: {
//         total: reviews.length,
//         average: avgRating.toFixed(1)
//       }
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

import Course from "../models/course.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import connectDB from '../configs/mongodb.js'; // 👈 FIX 1: Import the connection function

// Helper to safely get educator info
const getEducatorInfo = async (educatorId) => {
  try {
    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(educatorId)) {
      const educator = await User.findById(educatorId).select('name email imageUrl');
      if (educator) return educator;
    }
    // Return a placeholder for legacy Clerk IDs
    return { name: 'Unknown Educator', email: '', imageUrl: '' };
  } catch (error) {
    return { name: 'Unknown Educator', email: '', imageUrl: '' };
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    await connectDB(); // 👈 FIX 2: Connect before querying

    const courses = await Course.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .lean();

    // Manually populate educator info to handle legacy Clerk IDs
    const coursesWithEducator = await Promise.all(
      courses.map(async (course) => {
        const educator = await getEducatorInfo(course.educator);
        return { ...course, educator };
      })
    );

    res.json({ success: true, courses: coursesWithEducator });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get course by ID
export const getCourseId = async (req, res) => {
  const { id } = req.params;

  try {
    await connectDB(); // 👈 FIX 2: Connect before querying

    const courseData = await Course.findById(id).lean();

    if (!courseData) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Manually populate educator info to handle legacy Clerk IDs
    courseData.educator = await getEducatorInfo(courseData.educator);

    // Remove lectureUrl if isPreviewFree is false
    if (courseData.courseContent) {
      courseData.courseContent.forEach((chapter) => {
        chapter.chapterContent.forEach((lecture) => {
          if (!lecture.isPreviewFree) {
            lecture.lectureUrl = "";
          }
        });
      });
    }

    res.json({ success: true, courseData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Create a new course
export const createCourse = async (req, res) => {
  try {
    await connectDB(); // 👈 FIX 2: Connect before querying

    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update an existing course by ID
export const updateCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await connectDB(); // 👈 FIX 2: Connect before querying

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a course by ID
export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await connectDB(); // 👈 FIX 2: Connect before querying

    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Submit a review for a course
export const submitReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.userId;

  try {
    await connectDB(); // 👈 FIX 2: Connect before querying

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Check if user is enrolled
    if (!course.enrolledStudents.includes(userId)) {
      return res.status(403).json({ success: false, message: "You must be enrolled to review this course" });
    }

    // Get user name
    const user = await User.findById(userId);
    const userName = user?.name || "Anonymous";

    // Check if user already reviewed
    const existingReviewIndex = course.courseRatings.findIndex(r => r.userId === userId);

    if (existingReviewIndex >= 0) {
      // Update existing review
      course.courseRatings[existingReviewIndex].rating = rating;
      course.courseRatings[existingReviewIndex].comment = comment || "";
      course.courseRatings[existingReviewIndex].createdAt = new Date();
    } else {
      // Add new review
      course.courseRatings.push({
        userId,
        userName,
        rating,
        comment: comment || "",
        createdAt: new Date()
      });
    }

    await course.save();
    res.json({ success: true, message: "Review submitted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all reviews for a course
export const getReviews = async (req, res) => {
  const { id } = req.params;

  try {
    await connectDB(); // 👈 FIX 2: Connect before querying

    const course = await Course.findById(id).select('courseRatings');
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Sort by newest first
    const reviews = course.courseRatings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      reviews,
      stats: {
        total: reviews.length,
        average: avgRating.toFixed(1)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};