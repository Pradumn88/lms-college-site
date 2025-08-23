import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Clerk userId (string like "user_123")
    _id: { type: String, required: true },

    name: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String, required: true },

    // Store ObjectId refs to Course
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
