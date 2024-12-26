import { Server } from "socket.io";
import express from "express";
import { createServer } from "http"; 

const app = express();
const server = createServer(app);  
const io = new Server(server, {
  // Socket.io options (optional)
  cors: {
    origin: "*",  
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};  

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export { app, server, io, userSocketMap };
