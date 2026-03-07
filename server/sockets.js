const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Chat = require("./Models/Chat");
const Message = require("./Models/Message");

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  // auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  //connection
  io.on("connection", (socket) => {
    const userId = socket.userId;

    // Join room = userId
    socket.join(userId);

    // send msg
    socket.on("send_message", async ({ receiverId, text }) => {
      try {
        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) return;

        if (!text?.trim()) return;

        // Find or create chat
        let chat = await Chat.findOne({
          participants: { $all: [socket.userId, receiverId] },
        });

        if (!chat) {
          chat = await Chat.create({
            participants: [socket.userId, receiverId],
          });
        }

        // Save message
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          text,
          delivered: false,
          seen: false,
        });

        // Send to receiver
        io.to(receiverId).emit("receive_message", message);

        // Tell sender message is sent
        io.to(socket.userId).emit("receive_message", message);

        // If receiver is online → mark delivered
        const receiverSockets = await io.in(receiverId).fetchSockets();

        if (receiverSockets.length > 0) {
          await Message.findByIdAndUpdate(message._id, {
            delivered: true,
          });

          io.to(socket.userId).emit("message_delivered", {
            messageId: message._id,
          });
        }
      } catch (err) {
        console.error(err);
      }
    });

    //chat opened
    socket.on("chat_opened", async ({ receiverId }) => {
      try {
        // Find unseen messages sent by receiver
        const unseenMessages = await Message.find({
          sender: receiverId,
          chat: {
            $in: await Chat.find({
              participants: { $all: [socket.userId, receiverId] },
            }).distinct("_id"),
          },
          seen: false,
        });

        if (!unseenMessages.length) return;

        const messageIds = unseenMessages.map((msg) => msg._id);

        // Mark them seen
        await Message.updateMany({ _id: { $in: messageIds } }, { seen: true });

        // Emit seen event for each message
        messageIds.forEach((id) => {
          io.to(receiverId).emit("message_seen", {
            messageId: id,
          });
        });
      } catch (err) {
        console.error(err);
      }
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};
