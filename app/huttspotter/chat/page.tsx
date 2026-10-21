"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, MessageCircle, Clock } from "lucide-react";
import {
  getConversations,
  getOtherParticipant,
  Conversation,
} from "@/lib/chat";
import { useUser } from "@/context/UserContext";
import { ChatListSkeleton } from "@/components/ui";

export default function HuttspotterChatPage() {
  const router = useRouter();
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // No filter — one row per person, already deduplicated by backend
        const data = await getConversations();
        setConversations(data);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

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

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Chat</h1>
      </div>

      <div className="h-px bg-gray-100 mx-5 mb-2" />

      {loading ? (
        <ChatListSkeleton />
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">No conversations yet.</p>
          <p className="text-gray-300 text-xs mt-1">
            Tap "Contact Agent" on a listing to start
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {conversations.map((convo) => {
            const other = getOtherParticipant(convo, user?.id ?? "");
            // Use awaitingTheirReply for huttspotter's "Waiting" label
            const isWaiting = convo.awaitingTheirReply;

            return (
              <button
                key={convo._id}
                onClick={() => router.push(`/huttspotter/chat/${convo._id}`)}
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors text-left border-b border-gray-50"
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
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {other?.name?.charAt(0) ?? "A"}
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
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      {other?.name ?? "Agent"}
                    </p>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(convo.lastMessageAt)}
                    </p>
                  </div>

                  {/* Current property context from propertySnapshot */}
                  {convo.propertySnapshot && (
                    <p className="text-[10px] text-secondary font-medium mb-0.5 truncate">
                      {convo.propertySnapshot.title}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 truncate flex-1">
                      {convo.lastMessage}
                    </p>
                    {/* awaitingTheirReply = huttspotter waiting for agent */}
                    {isWaiting && (
                      <span className="text-[9px] text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                        <Clock size={8} />
                        Waiting
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
