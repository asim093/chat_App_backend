io.on("connection", (socket) => {
	console.log("a user connected", socket.id);
  
	const userId = socket.handshake.query.userId;
	if (userId !== "undefined") {
	  userSocketMap[userId] = socket.id;
	}
  
	// Notify all clients of online users
	io.emit("getOnlineUsers", Object.keys(userSocketMap));
  
	// Handle sending messages
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
  