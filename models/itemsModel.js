import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },

    category: {
      type: String,
      enum: ["lost", "found"],
    },

    // For LOST items
    lastSeenLocation: {
      type: String,
    },

    // For FOUND items
    foundLocation: {
      type: String,
    },

    claimed: {
      type: Boolean,
      default: false,
    },

    image: {
      type: String,
    },

    imagePublicId: {
      type: String,
    },

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Item", ItemSchema);
