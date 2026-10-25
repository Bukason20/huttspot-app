"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Smile, Send, Loader, Home } from "lucide-react";
import {
  getConversationMessages,
  markConversationRead,
  getOtherParticipant,
  Conversation,
  Message,
  Participant,
  PropertySnapshot,
} from "@/lib/chat";
import { getSocket } from "@/lib/socket";
import { useUser } from "@/context/UserContext";
import { ChatMessagesSkeleton } from "@/components/ui";

interface ChatConversationProps {
  backPath: string;
}

// ── Property card shown inside INQUIRY messages ───────────────
function InquiryPropertyCard({ snapshot }: { snapshot: PropertySnapshot }) {
  return (
    <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2 mb-1">
      {snapshot.coverPhoto ? (
        <img
          src={snapshot.coverPhoto}
          alt=""
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
          <Home size={14} className="text-gray-400" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[#1a1a1a] truncate">
          {snapshot.title}
        </p>
        <p className="text-[10px] text-gray-500">
          ₦{snapshot.price?.toLocaleString()} / {snapshot.paymentType}
          {snapshot.city ? ` · ${snapshot.city}` : ""}
        </p>
      </div>
      <span className="text-[9px] text-secondary font-bold bg-secondary/10 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-auto">
        Inquiry
      </span>
    </div>
  );
}

export default function ChatConversation({ backPath }: ChatConversationProps) {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const { user } = useUser();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [other, setOther] = useState<Participant | undefined>();

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getConversationMessages(conversationId);
        setConversation(res.conversation);
        setMessages(res.messages);
        setOther(getOtherParticipant(res.conversation, user?.id ?? ""));
        await markConversationRead(conversationId);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    load();

    const socket = getSocket();

    // Receive new message
    socket.on("receiveMessage", (message: Message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => {
          // If message is from me, replace the optimistic temp message
          if (message.sender === user?.id) {
            const hasTempMessage = prev.some((m) => m._id.startsWith("temp-"));
            if (hasTempMessage) {
              // Replace the oldest temp message with the confirmed one
              const firstTempIndex = prev.findIndex((m) =>
                m._id.startsWith("temp-"),
              );
              const updated = [...prev];
              updated[firstTempIndex] = message;
              return updated;
            }
          }
          // Avoid duplicates for incoming messages
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        markConversationRead(conversationId).catch(console.error);
      }
    });

    // Update conversation header when property context changes
    // propertySnapshot on the conversation updates when new inquiry arrives
    socket.on("conversationUpdated", (updatedConvo: Conversation) => {
      if (updatedConvo._id === conversationId) {
        setConversation(updatedConvo);
      }
    });

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
        if (cId === conversationId) setOtherUserTyping(false);
      },
    );

    return () => {
      socket.off("receiveMessage");
      socket.off("conversationUpdated");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [conversationId, user?.id]);

  const handleSend = () => {
    if (!input.trim() || !other) return;
    const socket = getSocket();
    const text = input.trim();

    // Optimistic message with temp ID
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      conversation: conversationId,
      sender: user?.id ?? "",
      text,
      type: "TEXT",
      readBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Send via socket
    socket.emit("sendMessage", {
      receiverId: other._id,
      text,
    });

    socket.emit("stopTyping", { conversationId });
    setInput("");
    setIsTyping(false);
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

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Current property context — always from conversation.propertySnapshot
  const currentSnapshot = conversation?.propertySnapshot;

  return (
    <div className="max-w-[390px] mx-auto h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      {/* Header */}
      <div className="bg-white flex flex-col border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push(backPath)}
            className="cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>

          {loading ? (
            // Skeleton for avatar + name while loading
            <>
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3.5 w-28 bg-gray-200 animate-pulse rounded-full" />
                <div className="h-2.5 w-16 bg-gray-200 animate-pulse rounded-full" />
              </div>
            </>
          ) : (
            <>
              {other?.profilePhoto ? (
                <img
                  src={other.profilePhoto}
                  alt={other.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {other?.name?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-[#1a1a1a] truncate">
                  {other?.name ?? "..."}
                </p>
                <p className="text-[10px] text-gray-400">
                  {other?.accountMode === "AGENT" ? "Agent" : "Huttspotter"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Property context banner skeleton */}
        {loading ? (
          <div className="flex items-center gap-2 px-4 pb-3 border-t border-gray-50 pt-2 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-gray-200 flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 w-32 bg-gray-200 rounded-full" />
              <div className="h-2.5 w-20 bg-gray-200 rounded-full" />
            </div>
          </div>
        ) : currentSnapshot ? (
          <div className="flex items-center gap-2 px-4 pb-3 border-t border-gray-50 pt-2">
            {currentSnapshot.coverPhoto ? (
              <img
                src={currentSnapshot.coverPhoto}
                alt=""
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center">
                <Home size={14} className="text-gray-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1a1a1a] truncate">
                {currentSnapshot.title}
              </p>
              <p className="text-[10px] text-gray-400">
                ₦{currentSnapshot.price?.toLocaleString()} /{" "}
                {currentSnapshot.paymentType}
              </p>
            </div>
            {conversation?.status === "PENDING_REPLY" && (
              <span className="text-[9px] text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded-full flex-shrink-0">
                PENDING
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <ChatMessagesSkeleton />
        ) : (
          <>
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
                    <>
                      {other?.profilePhoto ? (
                        <img
                          src={other.profilePhoto}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {other?.name?.charAt(0) ?? "?"}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className={`flex flex-col gap-1 max-w-[75%]`}>
                    {/* INQUIRY messages show property card above text */}
                    {msg.type === "INQUIRY" && msg.propertySnapshot && (
                      <InquiryPropertyCard snapshot={msg.propertySnapshot} />
                    )}

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
                {other?.profilePhoto ? (
                  <img
                    src={other.profilePhoto}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {other?.name?.charAt(0)}
                    </span>
                  </div>
                )}
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
