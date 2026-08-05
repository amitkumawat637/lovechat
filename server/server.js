const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const friendRoutes = require("./routes/friendRoutes");
const postRoutes = require("./routes/postRoutes");
const Message = require("./models/Message");
const User = require("./models/User");

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

let onlineUsers = {};

app.set("io", io);
app.set("onlineUsers", onlineUsers);

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/requests", friendRoutes);
app.use("/api/posts", postRoutes);

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
          seen: false,
        });
      }
    } catch (err) {
      console.error("Message save error:", err.message);
    }
  });

  socket.on("markSeen", async ({ senderId, receiverId }) => {
    try {
      const seenAt = new Date();

      await Message.updateMany(
        { sender: senderId, receiver: receiverId, seen: false },
        { seen: true, seenAt }
      );

      const senderSocketId = onlineUsers[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", { by: receiverId, seenAt });
      }
    } catch (err) {
      console.error("Mark seen error:", err.message);
    }
  });

  socket.on("disconnect", async () => {
    let disconnectedUserId = null;

    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        disconnectedUserId = userId;
        delete onlineUsers[userId];
      }
    }

    if (disconnectedUserId) {
      try {
        await User.findByIdAndUpdate(disconnectedUserId, { lastSeen: new Date() });
      } catch (err) {
        console.error("lastSeen update error:", err.message);
      }
    }

    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server Running On Port ${PORT}`);
});
