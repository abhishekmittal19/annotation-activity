require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { connectDB } = require("./config/database");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

app.set("io", io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = require("jsonwebtoken").verify(
      token,
      process.env.JWT_SECRET,
    );

    if (decoded.tokenUse !== "socket") {
      return next(new Error("Invalid socket token"));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error("Invalid or expired socket token"));
  }
});

io.on("connection", (socket) => {
  console.log("Authenticated socket:", socket.user.id, socket.user.role);

  socket.join(`role:${socket.user.role}`);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

connectDB();
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
