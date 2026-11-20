import { io } from "socket.io-client";

let socket = null;

export const connectSocket = async () => {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const response = await fetch("/api/auth/socket-token", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Socket authentication failed");
  }

  const { token } = await response.json();

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
    reconnection: true,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
