import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  biography: {
    type: String,
  },
  password: {
    type: String, // Now optional for Google users
  },
  googleId: {
    type: String, // Store Google ID for OAuth users
    unique: true,
    sparse: true, // Ensures uniqueness but allows null values
  },
  isInstructor: {
    type: Boolean,
    default: false,
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  createdCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  isVerified: {
    type: Boolean, // Google users should be verified by default
    default: false,
  },
  profilePicture: {
    type: String, // Store a URL (Google avatar or user-uploaded)
    default: "",
  },
});

const User = mongoose.model("User", userSchema);
export default User;
