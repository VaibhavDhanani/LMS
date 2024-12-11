import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  details: {
    totalHours: { type: Number, required: true },
    lectures: { type: Number, required: true },
    level: { type: String, required: true }
  },
  learnPoints: [String],
  technologies: {
    available: [String], 
    new: [{
      name: { type: String, required: true },
      logo: { type: String, required: true },
    }],
  },
  prerequisites: [String],
  requirements: [String],
  thumbnail: { type: String, required: true },
  promotionalVideo: { type: String, required: true },
  curriculum: [
    {
      section: { type: String, required: true },
      lectures: [
        {
          title: { type: String, required: true },
          description: { type: String, required: true },
          video: { type: String, required: true },
          duration: { type: String, required: true },
          preview: { type: Boolean, default: false }
        }
      ]
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
