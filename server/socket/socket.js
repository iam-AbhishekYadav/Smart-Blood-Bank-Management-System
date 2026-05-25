import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL?.split(",") ?? ["http://localhost:5173"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      return next();
    } catch {
      return next(new Error("Unauthorized socket"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user?.sub;
    if (userId) socket.join(`user:${userId}`);

    socket.on("join:request", (requestId) => {
      socket.join(`request:${requestId}`);
    });

    socket.on("donor:location-update", (payload) => {
      io.emit("donor:location-update", payload);
    });
  });

  return io;
};

export const getIO = () => io;

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};
