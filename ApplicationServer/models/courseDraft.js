import mongoose from "mongoose";

const courseDraftSchema = new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true },
      subtitle: { type: String, required: false, trim: true },
      description: { type: String, required: false, trim: true },
      instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      details: {
        totalHours: { type: Number, required: false, min: 0 },
        level: { type: String, required: false, enum: ["Beginner", "Intermediate", "Advanced"] },
        language: { type: String, required: false },
      },
      learnPoints: { type: [String], required: false },
      technologies: { type: [String], required: false },
      prerequisites: { type: [String], required: false },
      requirements: { type: [String], required: false },
      thumbnail: { type: String, required: false },
      promotionalVideo: { type: String },

      curriculum: [
        {
          section: { type: String, required: false, trim: true },
          lectures: [
            {
              title: { type: String, required: false, trim: true },
              description: { type: String, trim: true },
              video: { type: String },
              duration: { type: String, required: false },
              preview: { type: Boolean, default: false },
            },
          ],
        },
      ],

      targetStudents: { type: [String], required: true },
      topics: { type: [String], required: true },
      pricing: {
        price: { type: Number, required: false, min: 0 },
        discountEnabled: { type: Boolean, default: false },
        discount: { type: Number, min: 0, default: 0 },
      },

      createdAt: { type: Date, default: Date.now, immutable: true },
      lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true } // This automatically handles createdAt and updatedAt
);

const CourseDraft = mongoose.model("CourseDraft", courseDraftSchema);
export default CourseDraft;
