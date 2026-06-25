import mongoose from "mongoose";

const WardrobeItemSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    image_path: { type: String, required: true }, // Cloudinary secure URL
    name: { type: String, default: null },
    category: { type: String, required: true },
    color: { type: String, default: null },
    description: { type: String, default: null },
    use_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const WardrobeItem = mongoose.model("WardrobeItem", WardrobeItemSchema);
