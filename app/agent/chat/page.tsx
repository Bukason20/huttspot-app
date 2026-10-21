"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, MessageCircle, Clock, ArrowLeft } from "lucide-react";
import {
  getConversations,
  archiveConversation,
  getOtherParticipant,
  Conversation,
} from "@/lib/chat";
import { useUser } from "@/context/UserContext";
import { ChatListSkeleton } from "@/components/ui";

type Tab = "all" | "pending";

export default function AgentChatPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [pendingConversations, setPendingConversations] = useState<
    Conversation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Load all conversations on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getConversations();
        setAllConversations(data);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Load pending when tab switches to pending
  useEffect(() => {
    if (activeTab !== "pending" || pendingConversations.length > 0) return;
    const fetch = async () => {
      setPendingLoading(true);
      try {
        // Agent pending tab uses ?pending=true
        const data = await getConversations({ pending: true });
        setPendingConversations(data);
      } catch (err) {
        console.error("Failed to fetch pending:", err);
      } finally {
        setPendingLoading(false);
      }
    };
    fetch();
  }, [activeTab]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hrs ago`;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const handleArchive = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      await archiveConversation(conversationId);
      setAllConversations((prev) =>
        prev.filter((c) => c._id !== conversationId),
      );
      setPendingConversations((prev) =>
        prev.filter((c) => c._id !== conversationId),
      );
    } catch (err) {
      console.error("Failed to archive:", err);
    }
  };

  const pendingCount = allConversations.filter((c) => c.awaitingMyReply).length;
  const activeList =
    activeTab === "all" ? allConversations : pendingConversations;
  const isLoadingActive = activeTab === "all" ? loading : pendingLoading;

  const ConversationRow = ({ convo }: { convo: Conversation }) => {
    const other = getOtherParticipant(convo, user?.id ?? "");
    const needsMyReply = convo.awaitingMyReply;

    return (
      <button
        onClick={() => router.push(`/agent/chat/${convo._id}`)}
        className={`w-full flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors text-left border-b border-gray-50 ${
          needsMyReply
            ? "bg-secondary/5 hover:bg-secondary/10"
            : "hover:bg-gray-50"
        }`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {other?.profilePhoto ? (
            <img
              src={other.profilePhoto}
              alt={other.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-bold text-lg">
                {other?.name?.charAt(0) ?? "U"}
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

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-bold text-[#1a1a1a] truncate">
              {other?.name ?? "User"}
            </p>
            <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatTime(convo.lastMessageAt)}
            </p>
          </div>

          {/* Current property context */}
          {convo.propertySnapshot && (
            <p className="text-[10px] text-secondary font-medium mb-0.5 truncate">
              {convo.propertySnapshot.title}
            </p>
          )}

          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500 truncate flex-1">
              {convo.lastMessage}
            </p>
            {/* awaitingMyReply = agent needs to respond */}
            {needsMyReply && (
              <span className="text-[9px] text-white font-bold bg-secondary px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                <Clock size={8} />
                Reply
              </span>
            )}
          </div>
        </div>

        {/* Archive */}
        <button
          onClick={(e) => handleArchive(e, convo._id)}
          className="text-gray-200 hover:text-gray-400 cursor-pointer flex-shrink-0 p-1 transition-colors"
          title="Archive"
        >
          <span className="text-xs">✕</span>
        </button>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-5 pt-2 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="cursor-pointer">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Chat</h1>
        </div>
      </div>

      {/* Tabs — All | Pending */}
      <div className="flex items-center px-5 mb-2 border-b border-gray-100">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-3 text-sm font-semibold cursor-pointer border-b-2 transition-all ${
            activeTab === "all"
              ? "border-secondary text-secondary"
              : "border-transparent text-gray-400"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-3 text-sm font-semibold cursor-pointer border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "pending"
              ? "border-secondary text-secondary"
              : "border-transparent text-gray-400"
          }`}
        >
          Pending
          {pendingCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      {isLoadingActive ? (
        <ChatListSkeleton />
      ) : activeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <MessageCircle size={28} className="text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">
            {activeTab === "pending"
              ? "No pending conversations."
              : "No conversations yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {activeList.map((convo) => (
            <ConversationRow key={convo._id} convo={convo} />
          ))}
        </div>
      )}
    </div>
  );
}
