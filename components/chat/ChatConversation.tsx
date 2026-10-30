"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCheck,
  Clock,
  Lock,
  MapPin,
  Send,
  Smile,
} from "lucide-react";
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
import {
  Avatar,
  PropertyThumb,
  dayKey,
  formatClock,
  formatDayLabel,
  formatPrice,
  roleLabel,
} from "./chatUtils";

interface ChatConversationProps {
  backPath: string;
}

// ── Property card shown above INQUIRY messages ─────────────────
function InquiryPropertyCard({
  snapshot,
  onOpen,
}: {
  snapshot: PropertySnapshot;
  onOpen?: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className={`flex w-full max-w-[320px] items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2 pr-3 ${
        onOpen ? "cursor-pointer transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      <PropertyThumb snapshot={snapshot} size={52} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#1a1a1a]">
          {snapshot.title}
        </p>
        <p className="truncate text-xs text-gray-500">
          {formatPrice(snapshot)}
          {snapshot.city ? ` · ${snapshot.city}` : ""}
        </p>
      </div>
      <span className="flex-shrink-0 rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
        Inquiry
      </span>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="mx-auto h-6 w-20 rounded-full bg-gray-200" />
      <div className="flex items-end gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="h-12 w-52 rounded-2xl rounded-bl-md bg-gray-200" />
      </div>
      <div className="ml-auto h-12 w-60 rounded-2xl rounded-br-md bg-gray-200" />
      <div className="flex items-end gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="h-9 w-36 rounded-2xl rounded-bl-md bg-gray-200" />
      </div>
      <div className="ml-auto h-16 w-48 rounded-2xl rounded-br-md bg-gray-200" />
    </div>
  );
}

export default function ChatConversation({ backPath }: ChatConversationProps) {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const { user } = useUser();
  const isHuttspotter = backPath.startsWith("/huttspotter");

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [other, setOther] = useState<Participant | undefined>();

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
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

    setLoading(true);
    load();

    const socket = getSocket();

    // Receive new message
    const onReceiveMessage = (message: Message) => {
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
    };

    // Update conversation header when property context changes
    // propertySnapshot on the conversation updates when new inquiry arrives
    const onConversationUpdated = (updatedConvo: Conversation) => {
      if (updatedConvo._id === conversationId) {
        setConversation(updatedConvo);
      }
    };

    const onUserTyping = ({
      conversationId: cId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      if (cId === conversationId && userId !== user?.id) {
        setOtherUserTyping(true);
      }
    };

    const onUserStopTyping = ({
      conversationId: cId,
    }: {
      conversationId: string;
    }) => {
      if (cId === conversationId) setOtherUserTyping(false);
    };

    socket.on("receiveMessage", onReceiveMessage);
    socket.on("conversationUpdated", onConversationUpdated);
    socket.on("userTyping", onUserTyping);
    socket.on("userStopTyping", onUserStopTyping);

    // Remove only this screen's listeners (the conversation list keeps its own)
    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("conversationUpdated", onConversationUpdated);
      socket.off("userTyping", onUserTyping);
      socket.off("userStopTyping", onUserStopTyping);
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
    inputRef.current?.focus();
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

  // Current property context — always from conversation.propertySnapshot
  const currentSnapshot = conversation?.propertySnapshot;
  const openListing = (propertyId?: string) =>
    isHuttspotter && propertyId
      ? () => router.push(`/huttspotter/listing/${propertyId}`)
      : undefined;
  const isPending = conversation?.status === "PENDING_REPLY";
  const canSend = !!input.trim() && !!other;

  return (
    <div className="fixed inset-0 z-50 flex bg-[#f7f7f5] lg:static lg:z-auto lg:h-full lg:min-h-0">
      {/* ── Main column ─────────────────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3 px-3 py-3 sm:px-5">
            <button
              onClick={() => router.push(backPath)}
              aria-label="Back to messages"
              className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-[#1a1a1a] transition-colors hover:bg-gray-100 lg:hidden"
            >
              <ArrowLeft size={20} />
            </button>

            {loading ? (
              <>
                <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3.5 w-32 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-gray-200" />
                </div>
              </>
            ) : (
              <>
                <Avatar person={other} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold leading-tight text-[#1a1a1a]">
                    {other?.name ?? "..."}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      otherUserTyping ? "text-secondary" : "text-gray-500"
                    }`}
                  >
                    {otherUserTyping ? "typing…" : roleLabel(other)}
                  </p>
                </div>
                {isHuttspotter && currentSnapshot?.propertyId && (
                  <button
                    onClick={openListing(currentSnapshot.propertyId)}
                    className="hidden h-9 flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold transition-colors hover:bg-gray-50 sm:flex min-[1400px]:hidden"
                  >
                    View listing <ArrowUpRight size={15} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Property context */}
          {loading ? (
            <div className="flex animate-pulse items-center gap-3 border-t border-gray-100 px-4 py-2.5 sm:px-5">
              <div className="h-9 w-9 rounded-lg bg-gray-200" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-40 rounded-full bg-gray-200" />
                <div className="h-2.5 w-24 rounded-full bg-gray-200" />
              </div>
            </div>
          ) : currentSnapshot ? (
            <div
              onClick={openListing(currentSnapshot.propertyId)}
              className={`flex items-center gap-3 border-t border-gray-100 px-4 py-2.5 sm:px-5 min-[1400px]:hidden ${
                isHuttspotter ? "cursor-pointer hover:bg-gray-50" : ""
              }`}
            >
              <PropertyThumb snapshot={currentSnapshot} size={36} rounded="rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1a1a1a]">
                  {currentSnapshot.title}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {formatPrice(currentSnapshot)}
                  {currentSnapshot.city ? ` · ${currentSnapshot.city}` : ""}
                </p>
              </div>
              {isPending && (
                <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  <Clock size={11} /> Awaiting reply
                </span>
              )}
            </div>
          ) : null}
        </header>

        {/* Messages */}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <MessagesSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <Avatar person={other} size={64} />
              <p className="mt-4 font-poppins text-lg font-semibold">
                Say hello to {other?.name?.split(" ")[0] ?? "them"}
              </p>
              <p className="mt-1 max-w-xs text-sm text-gray-500">
                Ask about viewing times, the price or anything else about the
                property.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col px-3 py-5 sm:px-6">
              {messages.map((msg, i) => {
                const isMe = msg.sender === user?.id;
                const prev = messages[i - 1];
                const next = messages[i + 1];
                const newDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
                const nextNewDay = !next || dayKey(next.createdAt) !== dayKey(msg.createdAt);
                const firstOfGroup = newDay || prev.sender !== msg.sender;
                const lastOfGroup = nextNewDay || next.sender !== msg.sender;
                const isTemp = msg._id.startsWith("temp-");
                const isRead = !!other && msg.readBy?.includes(other._id);

                return (
                  <Fragment key={msg._id}>
                    {newDay && (
                      <div className="my-4 flex items-center gap-3">
                        <span className="h-px flex-1 bg-gray-200" />
                        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold text-gray-500">
                          {formatDayLabel(msg.createdAt)}
                        </span>
                        <span className="h-px flex-1 bg-gray-200" />
                      </div>
                    )}

                    <div
                      className={`flex items-end gap-2 ${
                        isMe ? "flex-row-reverse" : "flex-row"
                      } ${firstOfGroup ? "mt-3" : "mt-1"}`}
                    >
                      {!isMe &&
                        (lastOfGroup ? (
                          <Avatar person={other} size={30} className="mb-5" />
                        ) : (
                          <span className="w-[30px] flex-shrink-0" />
                        ))}

                      <div
                        className={`flex max-w-[82%] flex-col gap-1.5 sm:max-w-[70%] ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        {/* INQUIRY messages show property card above text */}
                        {msg.type === "INQUIRY" && msg.propertySnapshot && (
                          <InquiryPropertyCard
                            snapshot={msg.propertySnapshot}
                            onOpen={openListing(msg.propertySnapshot.propertyId)}
                          />
                        )}

                        <div
                          className={`whitespace-pre-wrap break-words px-4 py-2.5 text-[15px] leading-relaxed ${
                            isMe
                              ? `bg-secondary text-white ${
                                  lastOfGroup ? "rounded-2xl rounded-br-md" : "rounded-2xl"
                                } ${isTemp ? "opacity-70" : ""}`
                              : `border border-gray-100 bg-white text-[#1a1a1a] ${
                                  lastOfGroup ? "rounded-2xl rounded-bl-md" : "rounded-2xl"
                                }`
                          }`}
                        >
                          {msg.text}
                        </div>

                        {lastOfGroup && (
                          <p
                            className={`flex items-center gap-1 px-1 text-[11px] text-gray-400 ${
                              isMe ? "justify-end" : ""
                            }`}
                          >
                            {formatClock(msg.createdAt)}
                            {isMe &&
                              (isTemp ? (
                                <Clock size={12} aria-label="Sending" />
                              ) : isRead ? (
                                <CheckCheck size={14} className="text-secondary" aria-label="Read" />
                              ) : (
                                <Check size={13} aria-label="Sent" />
                              ))}
                          </p>
                        )}
                      </div>
                    </div>
                  </Fragment>
                );
              })}

              {/* Typing indicator */}
              {otherUserTyping && (
                <div className="mt-3 flex items-end gap-2">
                  <Avatar person={other} size={30} />
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3.5">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} className="h-1" />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-gray-100 bg-white px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 sm:px-5">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <div className="flex h-12 min-w-0 flex-1 items-center gap-1 rounded-full border border-gray-200 bg-[#f7f7f5] pl-1.5 pr-4 transition-colors focus-within:border-secondary">
              <button
                type="button"
                aria-label="Emoji"
                className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600"
              >
                <Smile size={20} />
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder="Write a message…"
                value={input}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                canSend
                  ? "cursor-pointer bg-secondary text-white hover:bg-[#08744a]"
                  : "cursor-not-allowed bg-gray-100 text-gray-400"
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Details panel (wide screens) ─────────────────────── */}
      <aside className="hidden w-[290px] flex-shrink-0 flex-col overflow-y-auto border-l border-gray-100 bg-white p-6 min-[1400px]:flex">
        {loading ? (
          <div className="flex animate-pulse flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-gray-200" />
            <div className="mt-4 h-3.5 w-32 rounded-full bg-gray-200" />
            <div className="mt-2 h-2.5 w-16 rounded-full bg-gray-200" />
            <div className="mt-8 h-48 w-full rounded-2xl bg-gray-200" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center">
              <Avatar person={other} size={80} />
              <p className="mt-4 font-poppins text-lg font-semibold">
                {other?.name}
              </p>
              <span className="mt-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                {roleLabel(other)}
              </span>
            </div>

            {currentSnapshot && (
              <div className="mt-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Talking about
                </p>
                <div className="overflow-hidden rounded-2xl border border-gray-100">
                  {currentSnapshot.coverPhoto ? (
                    <img
                      src={currentSnapshot.coverPhoto}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-100">
                      <PropertyThumb snapshot={currentSnapshot} size={48} />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-bold leading-snug">{currentSnapshot.title}</p>
                    {currentSnapshot.city && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={13} /> {currentSnapshot.city}
                      </p>
                    )}
                    <p className="mt-3 font-poppins text-lg font-semibold">
                      ₦{currentSnapshot.price?.toLocaleString()}
                      <span className="font-nunito text-xs font-semibold text-gray-500">
                        {" "}
                        / {currentSnapshot.paymentType}
                      </span>
                    </p>
                    {isHuttspotter && currentSnapshot.propertyId && (
                      <button
                        onClick={openListing(currentSnapshot.propertyId)}
                        className="mt-4 flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-secondary text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
                      >
                        View listing <ArrowUpRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isPending && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-primary/5 p-3 text-xs leading-relaxed text-gray-500">
                <Clock size={14} className="mt-0.5 flex-shrink-0 text-primary" />
                {isHuttspotter
                  ? "Waiting for the agent to reply to your inquiry."
                  : "This huttspotter is waiting for your reply."}
              </p>
            )}

            <p className="mt-auto flex items-start gap-2 pt-6 text-xs leading-relaxed text-gray-500">
              <Lock size={13} className="mt-0.5 flex-shrink-0 text-secondary" />
              {isHuttspotter
                ? "Your contact details are shared only after the agent replies."
                : "Keep conversations on HuttSpot so both sides stay protected."}
            </p>
          </>
        )}
      </aside>
    </div>
  );
}
