"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, MessageCircle, CheckCircle, X, ArrowLeft } from "lucide-react";
import {
  getConversations,
  getAgentInquiries,
  replyToInquiry,
  dismissInquiry,
  Conversation,
  Inquiry,
} from "@/lib/chat";

type Tab = "chats" | "inquiries";

export default function AgentChatPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply modal state
  const [replyingTo, setReplyingTo] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [convoData, inquiryData] = await Promise.all([
          getConversations(),
          getAgentInquiries(),
        ]);
        setConversations(convoData);
        setInquiries(inquiryData);
      } catch (err) {
        console.error("Failed to load chat data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hrs ago`;
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  const handleReply = async () => {
    if (!replyText.trim() || !replyingTo || sending) return;
    setSending(true);
    setReplyError("");
    try {
      const res = await replyToInquiry(replyingTo._id, replyText.trim());
      // Remove from inquiries, refresh conversations
      setInquiries((prev) => prev.filter((i) => i._id !== replyingTo._id));
      setReplyingTo(null);
      setReplyText("");
      // Navigate to the new conversation
      router.push(`/agent/chat/${res.conversationId}`);
    } catch (err: any) {
      setReplyError(err.message || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = async (inquiryId: string) => {
    try {
      await dismissInquiry(inquiryId);
      setInquiries((prev) => prev.filter((i) => i._id !== inquiryId));
    } catch (err) {
      console.error("Failed to dismiss inquiry:", err);
    }
  };

  const pendingInquiries = inquiries.filter((i) => i.status === "PENDING");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-5 pt-2 pb-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="cursor-pointer">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-[#1a1a1a]">Chat</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 px-5 mb-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 py-3 text-sm font-semibold cursor-pointer border-b-2 transition-all ${
            activeTab === "chats"
              ? "border-secondary text-secondary"
              : "border-transparent text-gray-400"
          }`}
        >
          Chats
          {conversations.length > 0 && (
            <span className="ml-1.5 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {conversations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`flex-1 py-3 text-sm font-semibold cursor-pointer border-b-2 transition-all ${
            activeTab === "inquiries"
              ? "border-secondary text-secondary"
              : "border-transparent text-gray-400"
          }`}
        >
          Inquiries
          {pendingInquiries.length > 0 && (
            <span className="ml-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingInquiries.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader size={28} className="text-secondary animate-spin" />
        </div>
      ) : activeTab === "chats" ? (
        /* ── CHATS TAB ─────────────────────────────────────────── */
        conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <MessageCircle size={28} className="text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No active chats yet.</p>
            <p className="text-gray-300 text-xs mt-1">
              Reply to an inquiry to start chatting
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((convo) => (
              <button
                key={convo._id}
                onClick={() => router.push(`/agent/chat/${convo._id}`)}
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors text-left"
              >
                <div className="relative flex-shrink-0">
                  {convo.otherParticipant?.profilePhoto ? (
                    <img
                      src={convo.otherParticipant.profilePhoto}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-bold">
                        {convo.otherParticipant?.name?.charAt(0) ?? "U"}
                      </span>
                    </div>
                  )}
                  {convo.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">
                        {convo.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      {convo.otherParticipant?.name ?? "User"}
                    </p>
                    <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {formatTime(convo.lastMessageAt)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {convo.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )
      ) : /* ── INQUIRIES TAB ─────────────────────────────────────── */
      pendingInquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <CheckCircle size={28} className="text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No pending inquiries.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5">
          {pendingInquiries.map((inquiry) => (
            <div
              key={inquiry._id}
              className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
            >
              {/* Property info */}
              <div className="flex items-center gap-3 mb-3">
                {inquiry.property.media?.photos?.[0] ? (
                  <img
                    src={inquiry.property.media.photos[0]}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-medium">
                    Inquiry for
                  </p>
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                    {inquiry.property.title}
                  </p>
                </div>
                <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded-full flex-shrink-0">
                  PENDING
                </span>
              </div>

              {/* Sender info — name only, no contact details */}
              <div className="flex items-center gap-2 mb-3">
                {inquiry.sender.profilePhoto ? (
                  <img
                    src={inquiry.sender.profilePhoto}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {inquiry.sender.name?.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {inquiry.sender.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {formatTime(inquiry.createdAt)}
                  </p>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-600 bg-white rounded-xl px-3 py-2 border border-gray-100 mb-3 leading-relaxed">
                {inquiry.message}
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReplyingTo(inquiry)}
                  className="flex-1 bg-secondary text-white rounded-full py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Reply
                </button>
                <button
                  onClick={() => handleDismiss(inquiry._id)}
                  className="flex-1 border border-gray-200 text-gray-400 rounded-full py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl px-6 pt-6 pb-10">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">
                  Reply to Inquiry
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  From: {replyingTo.sender.name}
                </p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="cursor-pointer text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Original message */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-400 mb-1">Their message:</p>
              <p className="text-sm text-gray-600">{replyingTo.message}</p>
            </div>

            <p className="text-xs text-gray-400 bg-blue-50 rounded-xl p-3 mb-4">
              Replying will start a chat and reveal both your contact details to
              each other.
            </p>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Yes, the property is still available..."
              rows={3}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-gray-300 resize-none mb-3"
            />

            {replyError && (
              <p className="text-red-500 text-xs mb-3">{replyError}</p>
            )}

            <button
              onClick={handleReply}
              disabled={!replyText.trim() || sending}
              className={`w-full rounded-full py-4 text-[15px] font-semibold transition-all ${
                replyText.trim() && !sending
                  ? "bg-secondary text-white cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {sending ? "Sending..." : "Send Reply & Start Chat"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
