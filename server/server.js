require("dotenv").config();
const http = require("http");
const onlineUsers = new Map();
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const app = express();
connectDB();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options(/.*/, cors());
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const momentRoutes = require("./routes/momentRoutes");
const friendRoutes = require("./routes/friendRoutes");
const User = require("./models/User");
const Chat = require("./models/Chat");
const Message = require("./models/Message");

app.use("/api/moments", momentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/friends", friendRoutes);

app.get("/", (req, res) => res.send("MOCEgram API Running"));
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ message: "Internal server error" });
});
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) return next(new Error("Not authorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  socket.join(socket.user._id.toString());
  socket.on("chat_opened", async ({ chatId }) => {
    try {
      const messages = await Message.find({
        chat: chatId,
        sender: { $ne: socket.user._id },
        seen: false,
      });

      for (let msg of messages) {
        msg.seen = true;
        await msg.save();

        // Notify original sender
        io.to(msg.sender.toString()).emit("message_seen", {
          messageId: msg._id,
        });
      }
    } catch (err) {
      console.error("Error marking seen:", err);
    }
  });
  socket.on("message_seen", ({ messageId }) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, seen: true } : msg)),
    );
  });
  socket.on("send_message", async ({ receiverId, text }) => {
    try {
      const userId = socket.user._id.toString();

      onlineUsers.set(userId, socket.id);


      // Notify everyone
      io.emit("user_online", userId);

      // Send full list to newly connected user
      socket.emit("online_users", Array.from(onlineUsers.keys()));

      socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        io.emit("user_offline", userId);
      });

      //  Find or create chat
      let chat = await Chat.findOne({
        participants: { $all: [socket.user._id, receiverId] },
      });

      if (!chat) {
        chat = await Chat.create({
          participants: [socket.user._id, receiverId],
        });
      }

      //  Save message
      const message = await Message.create({
        chat: chat._id,
        sender: socket.user._id,
        text,
      });

      //  Emit to receiver
      const payload = {
        _id: message._id,
        chatId: chat._id,
        sender: socket.user._id,
        text: message.text,
        createdAt: message.createdAt,
        delivered: false,
      };
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        // Receiver is online → mark delivered
        message.delivered = true;
        await message.save();

        payload.delivered = true;

        io.to(receiverSocketId).emit("receive_message", payload);

        // Notify sender message was delivered
        socket.emit("message_delivered", {
          messageId: message._id,
        });
      } else {
        // Receiver offline
        io.to(receiverId).emit("receive_message", payload);
      }
      // Always emit to sender
      // Always send message to receiver
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", payload);
        // Tell sender it was delivered
        socket.emit("message_delivered", {
          messageId: message._id,
        });
      } else {
        io.to(receiverId).emit("receive_message", payload);
      }
      // Only send once to sender (without re-emitting later)
      socket.emit("receive_message", payload);
    } catch (err) {
      console.error(err);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
