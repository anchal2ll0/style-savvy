import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    occasion: String,
    mood: String,
    weather: String,
    result: mongoose.Schema.Types.Mixed,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const Recommendation = mongoose.model("Recommendation", RecommendationSchema);
