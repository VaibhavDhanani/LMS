import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    Content: {
      type: String, // NVARCHAR (MAX) maps to String
      required: true, // NOT NULL
    },
    Rating: {
      type: Number, // INT maps to Number
      required: true, // NOT NULL
      min: 1, // Optional: Ensure rating is within a valid range
      max: 5,
    },
    CreatedAt: {
      type: Date, // DATETIME2 maps to Date
      required: true, // NOT NULL
      default: Date.now, // Automatically set current timestamp
    },
    CourseId: {
      type: mongoose.Schema.Types.ObjectId, // Foreign key referencing Courses
      required: true, // NOT NULL
      ref: "Course", // Reference to the Courses collection
    },
    LearnerId: {
      type: mongoose.Schema.Types.ObjectId, // Foreign key referencing Learners
      required: true, // NOT NULL
      ref: "User", // Reference to the Learners collection
    },
  }
);


const Review = mongoose.model("Review", reviewSchema);
export default Review;
