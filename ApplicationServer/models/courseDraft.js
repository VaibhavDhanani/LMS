import mongoose from "mongoose";

const courseDraftSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  details: {
    totalHours: Number,
    lectures: Number,
    level: String
  },
  learnPoints: [String],
  technologies: {
    available: [String],  // Array of selected predefined tech names
    new: [{
      name: String,
      logo: String,
    }],
  },
  prerequisites: [String],
  requirements: [String],
  thumbnail: String,
  promotionalVideo: String,
  curriculum: [
    {
      section: String,
      lectures: [
        {
          title: String,
          description: String,
          video: String,
          duration: String,
          preview: Boolean
        }
      ]
    }
  ],
  targetStudents: [String],
  topics: [String],
  pricing: {
    price: Number,
    discountEnabled: Boolean,
    discount: Number,
  },
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const CourseDraft = mongoose.model("CourseDraft", courseDraftSchema);
export default CourseDraft;
