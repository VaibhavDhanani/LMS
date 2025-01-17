import mongoose from "mongoose";

const courseDraftSchema = new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true },
      subtitle: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      details: {
        totalHours: { type: Number, required: true, min: 0 },
        level: { type: String, required: true, enum: ["Beginner", "Intermediate", "Advanced"] },
      },
      learnPoints: { type: [String], required: true },
      technologies: { type: [String], required: true },
      prerequisites: { type: [String], required: true },
      requirements: { type: [String], required: true },
      thumbnail: { type: String, required: true },
      promotionalVideo: { type: String },

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
            },
          ],
        },
      ],

      targetStudents: { type: [String], required: true },
      topics: { type: [String], required: true },
      pricing: {
        price: { type: Number, required: true, min: 0 },
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
