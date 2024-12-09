import mongoose from "mongoose";

const courseSchema =new mongoose.Schema({
  id: String,
  title: String,
  subtitle: String,
  description: String,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  videos: [String],
  materials: [String],
  price: {
    original: Number,
    discounted: Number
  },
  details: {
    totalHours: Number,
    lectures: Number,
    level: String,
    lastUpdated: Date
  },
  enrolledStudents:[{
    type: mongoose.Schema.Types.ObjectId,
    ref : 'User', 
  }],
  learnPoints: [String],
  learnStack: [String],
  prerequisites: [String],
  curriculum: [
    {
      section: String,
      lectures: [
        {
          title: String,
          duration: String,
          preview: Boolean
        }
      ]
    }
  ],
  requirements: [String],
  targetStudents: [String],
  rating: Number,
  reviews: [
    {
      id: String,
      userName: String,
      rating: Number,
      comment: String
    }
  ],
  isActive: Boolean,
  createdAt: Date
})


const Course = mongoose.model("Course", courseSchema);
export default Course;
