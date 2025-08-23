import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String },
    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },

    // Educator reference
    educator: {
      type: String, // Clerk userId string
      ref: "User",
      required: true,
    },

    // Chapters + Lectures
    courseContent: [
      {
        chapterTitle: String,
        chapterContent: [
          {
            lectureTitle: String,
            lectureUrl: String,
            isPreviewFree: { type: Boolean, default: false },
          },
        ],
      },
    ],

    // 📌 Store students enrolled by Clerk userId (string)
    enrolledStudents: [
      {
        type: String, // userId like "user_123"
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
