import mongoose from "mongoose";

const courseDraftSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, default: "", trim: true },
        description: { type: String, default: "", trim: true },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        details: {
            level: { type: String, default: "Beginner", enum: ["Beginner", "Intermediate", "Advanced"] },
            language: { type: String, default: "English" },
        },
        learnPoints: { type: [String], default: [] },
        technologies: { type: [String], default: [] },
        prerequisites: { type: [String], default: [] },
        requirements: { type: [String], default: [] },
        thumbnail: { type: String, default: "" },
        promotionalVideo: { type: String, default: "" },
        curriculum: [
            {
                section: { type: String, default: "", trim: true },
                lectures: [
                    {
                        title: { type: String, default: "", trim: true },
                        description: { type: String, default: "", trim: true },
                        video: { type: String, default: "" },
                        duration: { type: Number, default: 0 },
                        preview: { type: Boolean, default: false },
                    },
                ],
            },
        ],
        targetStudents: { type: [String], default: [] },
        topics: { type: [String], default: [] },
        pricing: {
            price: { type: Number, default: 0, min: 0 },
            discountEnabled: { type: Boolean, default: false },
            discount: { type: Number, default: 0, min: 0 },
        },
        createdAt: { type: Date, default: Date.now, immutable: true },
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true } 
);


const CourseDraft = mongoose.model("CourseDraft", courseDraftSchema);
export default CourseDraft;
