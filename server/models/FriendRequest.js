const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // "pending" → sent, "accepted" → friends, "rejected" → declined
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// A pair can only have one active request at a time
friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports =
  mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", friendRequestSchema);
