const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Love Chat Backend Running...");
});

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Track online users: { userId: socketId }
let onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getMessage", {
          _id: message._id,
          sender: senderId,
          receiver: receiverId,
          text,
          createdAt: message.createdAt,
        });
      }
    } catch (err) {
      console.error("Message save error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server Running On Port ${PORT}`);
});