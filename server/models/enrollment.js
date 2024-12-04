import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId, // Foreign key referencing Courses
      required: true, // NOT NULL
      ref: "Course", // Reference to the Courses collection
    },
    learnerId: {
      type: mongoose.Schema.Types.ObjectId, // Foreign key referencing Learners
      required: true, // NOT NULL
      ref: "User", // Reference to the Learners collection
    },
    amount: {
      type: Number, // REAL maps to Number
      required: true, // NOT NULL
    },
    transactionId: {
      type: String, // NVARCHAR(MAX) maps to String
      required: true, // NOT NULL
    },
    transactionDate: {
      type: Date, // DATETIME2 maps to Date
      required: true, // NOT NULL
      default: new Date(0), // DEFAULT ('0001-01-01T00:00:00.0000000')
    },
  }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
