import mongoose from "mongoose";

const SavedOutfitSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    item_ids: { type: [String], default: [] },
    reasoning: { type: String, default: null },
    score: { type: Number, default: null },
    occasion: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const SavedOutfit = mongoose.model("SavedOutfit", SavedOutfitSchema);
