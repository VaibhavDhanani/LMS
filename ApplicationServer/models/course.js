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
    level: { type: String, required: true },
    language: { type: String, required: true }
  },
  learnPoints: { type: [String], required: true },
  technologies: [String],
  prerequisites: [String],
  requirements: [String],
  thumbnail: { type: String, required: true },
  promotionalVideo: { type: String, required: true },
  curriculum: [
    {
      section: { type: String, required: true, trim: true },
      lectures: [
        {
          title: { type: String, required: true, trim: true },
          description: { type: String, trim: true },
          video: { type: String },
          duration: { type: String, required: true },
          preview: { type: Boolean, default: false },
          thumbnailurl: { type: String, required: false },
        },
      ],
    },
  ],

  targetStudents: { type: [String], required: true },
  topics: { type: [String], required: true },
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
