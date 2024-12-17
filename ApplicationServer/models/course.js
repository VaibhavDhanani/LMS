import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  details: {
    totalHours: { type: Number, required: false },
    level: { type: String, required: true }
  },
  learnPoints: [String],
  technologies: [String],
  prerequisites: [String],
  requirements: [String],
  thumbnail: { type: String, required: false },
  promotionalVideo: { type: String, required: false },
  
      lectures: [
        {
          title: { type: String, required: false },
          description: { type: String, required: false },
          video: { type: String, required: false },
          duration: { type: String, required: false },
          preview: { type: Boolean, default: false }
        }
      ],
  targetStudents: [String],
  topics: [String],
  pricing: {
    price: { type: Number, required: true },
    discountEnabled: { type: Boolean, default: false },
    discount: { type: Number }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  rating: { type: Number, default: 0 },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
