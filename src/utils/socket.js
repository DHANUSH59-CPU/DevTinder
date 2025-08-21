const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // Save messages to the database
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          // Check if userId & targetUserId are friends
          const connection = await ConnectionRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
              { fromUserId: targetUserId, toUserId: userId, status: "accepted" }
            ]
          });

          if (!connection) {
            socket.emit("messageError", { error: "You can only message connected users" });
            return;
          }

          // Validate message content
          if (!text || text.trim().length === 0) {
            socket.emit("messageError", { error: "Message cannot be empty" });
            return;
          }

          if (text.length > 1000) {
            socket.emit("messageError", { error: "Message too long (max 1000 characters)" });
            return;
          }

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text: text.trim(),
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", { firstName, lastName, text: text.trim() });
        } catch (err) {
          console.error("Socket message error:", err);
          socket.emit("messageError", { error: "Failed to send message" });
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;