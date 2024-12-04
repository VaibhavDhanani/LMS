import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    Title: {
      type: String, // NVARCHAR (MAX) is mapped to String
      required: true, // NOT NULL
    },
    Description: {
      type: String, // NVARCHAR (MAX) is mapped to String
      required: true, // NOT NULL
    },
    Videos: [
        {
          type: String, // Firebase video links
          required: [true, "Please add video links"],
        },
      ],
      Materials: [
        {
          type: String, // Firebase material links (e.g., PDFs, docs)
          required: false, // Optional field
        },
      ],
      Price: {
      type: Number, // REAL is mapped to Number
      required: true, // NOT NULL
    },
    CreatedAt: {
      type: Date, // DATETIME2 is mapped to Date
      required: true, // NOT NULL
      default: Date.now, // Automatically set current timestamp
    },
    TeacherId: {
      type: mongoose.Schema.Types.ObjectId, // Foreign key referencing Teachers
      required: true, // NOT NULL
      ref: "User", // Reference to the Teachers collection
    },
    IsActive: {
      type: Boolean, // BIT is mapped to Boolean
      default: true, // DEFAULT (1)
    },
    Rating: {
      type: Number, // REAL is mapped to Number
      default: 0, // DEFAULT (0)
    },
    Reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Review',
    }]
  },
);


const Course = mongoose.model("Course", courseSchema);
export default Course;
