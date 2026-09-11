"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Phone, Smile, Send, Loader } from "lucide-react";
import { getMessages, Message } from "@/lib/chat";
import { getSocket } from "@/lib/socket";
import { useUser } from "@/context/UserContext";

export default function HuttspotterChatConversation() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUser, setOtherUser] = useState<{
    name: string;
    photo?: string;
  } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages + connect socket
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await getMessages(conversationId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const socket = getSocket();

    // Listen for incoming messages
    socket.on("receiveMessage", (message: Message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Listen for typing indicator
    socket.on(
      "userTyping",
      ({
        conversationId: cId,
        userId,
      }: {
        conversationId: string;
        userId: string;
      }) => {
        if (cId === conversationId && userId !== user?.id) {
          setOtherUserTyping(true);
        }
      },
    );

    socket.on(
      "userStopTyping",
      ({ conversationId: cId }: { conversationId: string }) => {
        if (cId === conversationId) {
          setOtherUserTyping(false);
        }
      },
    );

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [conversationId, user?.id]);

  const handleSend = () => {
    if (!input.trim()) return;

    const socket = getSocket();

    // Optimistically add message to UI
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      conversation: conversationId,
      sender: user?.id ?? "",
      text: input.trim(),
      readBy: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Send via socket
    socket.emit("sendMessage", {
      receiverId: otherUser ?? "", // ← will be set from conversation data
      text: input.trim(),
    });

    // Stop typing indicator
    socket.emit("stopTyping", { conversationId });

    setInput("");
    setOtherUserTyping(false);
  };

  const handleTyping = (value: string) => {
    setInput(value);
    const socket = getSocket();

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { conversationId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTyping", { conversationId });
    }, 1500);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-[390px] mx-auto h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-white flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        {otherUser?.photo ? (
          <img
            src={otherUser.photo}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {otherUser?.name?.charAt(0) ?? "A"}
            </span>
          </div>
        )}
        <p className="flex-1 text-base font-bold text-[#1a1a1a]">
          {otherUser?.name ?? "Agent"}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader size={24} className="text-secondary animate-spin" />
          </div>
        ) : (
          <>
            {/* Date pill */}
            <div className="flex justify-center">
              <span className="bg-gray-300 text-gray-600 text-xs font-medium px-4 py-1 rounded-full">
                Today
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.sender === user?.id;
              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {otherUser?.name?.charAt(0) ?? "A"}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-gray-200 text-[#1a1a1a] rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p
                      className={`text-[10px] text-gray-400 ${isMe ? "text-right" : "text-left"}`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {otherUserTyping && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <div className="bg-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-t border-gray-100">
        <button className="cursor-pointer text-gray-400">
          <Smile size={22} />
        </button>
        <input
          type="text"
          placeholder="Message"
          value={input}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
        />
        <button
          onClick={handleSend}
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
            input.trim() ? "bg-secondary" : "bg-gray-200"
          }`}
        >
          <Send size={16} color={input.trim() ? "#fff" : "#9ca3af"} />
        </button>
      </div>
    </div>
  );
}
