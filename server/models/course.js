import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String, // NVARCHAR (MAX) is mapped to String
      required: true, // NOT NULL
    },
    description: {
      type: String, // NVARCHAR (MAX) is mapped to String
      required: true, // NOT NULL
    },
    videos: [
        {
          type: String, // Firebase video links
          required: [true, "Please add video links"],
        },
      ],
    materials: [
        {
          type: String, // Firebase material links (e.g., PDFs, docs)
          required: false, // Optional field
        },
      ],
    price: {
      type: Number, // REAL is mapped to Number
      required: true, // NOT NULL
    },
    createdAt: {
      type: Date, // DATETIME2 is mapped to Date
      required: true, // NOT NULL
      default: Date.now, // Automatically set current timestamp
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId, // Foreign key referencing Teachers
      required: true, // NOT NULL
      ref: "User", // Reference to the Teachers collection
    },
    isActive: {
      type: Boolean, // BIT is mapped to Boolean
      default: true, // DEFAULT (1)
    },
    rating: {
      type: Number, // REAL is mapped to Number
      default: 0, // DEFAULT (0)
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Review',
    }],
    
    enrolledStudents:[{
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User', 
    }],
  }, 
);


const Course = mongoose.model("Course", courseSchema);
export default Course;
