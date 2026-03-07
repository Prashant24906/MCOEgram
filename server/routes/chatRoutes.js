const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const mongoose = require('mongoose')

// Get messages between two users
// GET all chats of logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate("participants", "name email profilePic")
      .sort({ updatedAt: -1 });

    // Attach last message to each chat
    const chatsWithLastMessage = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chat: chat._id })
          .sort({ createdAt: -1 });

        return {
          ...chat.toObject(),
          lastMessage
        };
      })
    );
    res.json(chatsWithLastMessage);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

router.get("/:userId", protect, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    // validate ObjectId FIRST
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const chat = await Chat.findOne({
      participants: { $all: [req.user._id, otherUserId] }
    });
    if (!chat) return res.json([]);
    const messages = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    console.error("Chat fetch error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});
module.exports = router;