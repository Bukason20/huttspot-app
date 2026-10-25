import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    socket = io(process.env.NEXT_PUBLIC_API_BASE_URL!, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      socket = null; // allow reconnection
    });

    socket.on("errorMessage", ({ message }: { message: string }) => {
      console.error("Socket error:", message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
