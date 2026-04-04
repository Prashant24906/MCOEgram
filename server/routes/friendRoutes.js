const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect } = require("../middlewares/authMiddleware");
const FriendRequest = require("../models/FriendRequest");

// ─── Helpers ─────────────────────────────────────────────────────────────────
function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── POST /api/friends/request/:receiverId ───────────────────────────────────
// Send a friend request
router.post("/request/:receiverId", protect, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    if (!validId(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID" });
    }

    if (senderId.toString() === receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });
    }

    // Check if a request already exists in either direction
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existing) {
      return res.status(409).json({
        message: "Friend request already exists",
        request: existing,
      });
    }

    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("Send friend request error:", err);
    res.status(500).json({ message: "Failed to send friend request" });
  }
});

// ─── DELETE /api/friends/request/:receiverId ─────────────────────────────────
// Cancel a pending request the logged-in user sent
router.delete("/request/:receiverId", protect, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    if (!validId(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID" });
    }

    const result = await FriendRequest.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (!result) {
      return res.status(404).json({ message: "No pending request found" });
    }

    res.json({ message: "Request cancelled" });
  } catch (err) {
    console.error("Cancel friend request error:", err);
    res.status(500).json({ message: "Failed to cancel request" });
  }
});

// ─── PUT /api/friends/request/:requestId/accept ──────────────────────────────
// Accept a friend request (receiver only)
router.put("/request/:requestId/accept", protect, async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!validId(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the receiver can accept this request" });
    }

    request.status = "accepted";
    await request.save();

    res.json(request);
  } catch (err) {
    console.error("Accept friend request error:", err);
    res.status(500).json({ message: "Failed to accept request" });
  }
});

// ─── PUT /api/friends/request/:requestId/reject ──────────────────────────────
// Reject a friend request (receiver only)
router.put("/request/:requestId/reject", protect, async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!validId(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the receiver can reject this request" });
    }

    request.status = "rejected";
    await request.save();

    res.json(request);
  } catch (err) {
    console.error("Reject friend request error:", err);
    res.status(500).json({ message: "Failed to reject request" });
  }
});

// ─── GET /api/friends/status/:otherUserId ────────────────────────────────────
// Get the friendship status between logged-in user and another user.
// Returns: { status: "none"|"pending_sent"|"pending_received"|"accepted"|"rejected", requestId }
router.get("/status/:otherUserId", protect, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const me = req.user._id;

    if (!validId(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const request = await FriendRequest.findOne({
      $or: [
        { sender: me, receiver: otherUserId },
        { sender: otherUserId, receiver: me },
      ],
    });

    if (!request) {
      return res.json({ status: "none", requestId: null });
    }

    let status;
    if (request.status === "accepted") {
      status = "accepted";
    } else if (request.status === "rejected") {
      status = "rejected";
    } else if (request.sender.toString() === me.toString()) {
      status = "pending_sent";
    } else {
      status = "pending_received";
    }

    res.json({ status, requestId: request._id });
  } catch (err) {
    console.error("Friendship status error:", err);
    res.status(500).json({ message: "Failed to get friendship status" });
  }
});

// ─── GET /api/friends/requests/incoming ──────────────────────────────────────
// Get all incoming pending friend requests for logged-in user
router.get("/requests/incoming", protect, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "name email profilePic");

    res.json(requests);
  } catch (err) {
    console.error("Incoming requests error:", err);
    res.status(500).json({ message: "Failed to fetch incoming requests" });
  }
});

// ─── GET /api/friends ─────────────────────────────────────────────────────────
// Get all accepted friends of logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const me = req.user._id;

    const accepted = await FriendRequest.find({
      $or: [{ sender: me }, { receiver: me }],
      status: "accepted",
    })
      .populate("sender", "name email profilePic")
      .populate("receiver", "name email profilePic");

    // Return the "other" user in each pair
    const friends = accepted.map((r) =>
      r.sender._id.toString() === me.toString() ? r.receiver : r.sender
    );

    res.json(friends);
  } catch (err) {
    console.error("Get friends error:", err);
    res.status(500).json({ message: "Failed to fetch friends" });
  }
});

module.exports = router;
