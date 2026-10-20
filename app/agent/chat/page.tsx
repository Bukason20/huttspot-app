"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Home,
} from "lucide-react";
import {
  getConversations,
  getOtherParticipant,
  Conversation,
  Participant,
} from "@/lib/chat";
import { useUser } from "@/context/UserContext";

interface GroupedConversation {
  participant: Participant;
  conversations: Conversation[];
  latestMessageAt: string;
  totalUnread: number;
  isExpanded: boolean;
}

export default function AgentChatPage() {
  const router = useRouter();
  const { user } = useUser();
  const [grouped, setGrouped] = useState<GroupedConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getConversations();

        // Group conversations by other participant's _id
        const groupMap = new Map<string, GroupedConversation>();

        data.forEach((convo) => {
          const other = getOtherParticipant(convo, user?.id ?? "");
          if (!other) return;

          const existing = groupMap.get(other._id);

          if (existing) {
            existing.conversations.push(convo);
            existing.totalUnread += convo.unreadCount;
            // Keep the most recent lastMessageAt
            if (
              new Date(convo.lastMessageAt) > new Date(existing.latestMessageAt)
            ) {
              existing.latestMessageAt = convo.lastMessageAt;
            }
          } else {
            groupMap.set(other._id, {
              participant: other,
              conversations: [convo],
              latestMessageAt: convo.lastMessageAt,
              totalUnread: convo.unreadCount,
              isExpanded: false,
            });
          }
        });

        // Sort groups by latest message, most recent first
        const groups = Array.from(groupMap.values()).sort(
          (a, b) =>
            new Date(b.latestMessageAt).getTime() -
            new Date(a.latestMessageAt).getTime(),
        );

        setGrouped(groups);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?.id]);

  const toggleExpand = (participantId: string) => {
    setGrouped((prev) =>
      prev.map((g) =>
        g.participant._id === participantId
          ? { ...g, isExpanded: !g.isExpanded }
          : g,
      ),
    );
  };

  const handleConversationClick = (
    group: GroupedConversation,
    convo?: Conversation,
  ) => {
    if (group.conversations.length === 1) {
      // Only one conversation — go straight to it
      router.push(`/huttspotter/chat/${group.conversations[0]._id}`);
    } else if (convo) {
      // Expanded sub-item clicked
      router.push(`/huttspotter/chat/${convo._id}`);
    } else {
      // Multiple conversations — toggle expand
      toggleExpand(group.participant._id);
    }
  };

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

  const getConvoLabel = (convo: Conversation) => {
    if (convo.type === "PROPERTY_INQUIRY" && convo.propertySnapshot) {
      return convo.propertySnapshot.title;
    }
    return "Direct Message";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Chat</h1>
      </div>

      <div className="h-px bg-gray-100 mx-5 mb-2" />

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader size={28} className="text-secondary animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
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
          {grouped.map((group) => {
            const hasMultiple = group.conversations.length > 1;
            // Latest conversation for preview
            const latest = group.conversations.sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime(),
            )[0];
            const isPending =
              latest.status === "PENDING_REPLY" && latest.awaitingTheirReply;

            return (
              <div key={group.participant._id}>
                {/* Group header row */}
                <button
                  onClick={() => handleConversationClick(group)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors text-left border-b border-gray-50"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {group.participant.profilePhoto ? (
                      <img
                        src={group.participant.profilePhoto}
                        alt={group.participant.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {group.participant.name?.charAt(0) ?? "A"}
                        </span>
                      </div>
                    )}
                    {group.totalUnread > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">
                          {group.totalUnread}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-bold text-[#1a1a1a]">
                        {group.participant.name}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <p className="text-xs text-gray-400">
                          {formatTime(group.latestMessageAt)}
                        </p>
                        {hasMultiple &&
                          (group.isExpanded ? (
                            <ChevronUp size={14} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={14} className="text-gray-400" />
                          ))}
                      </div>
                    </div>

                    {/* Latest message preview */}
                    {latest.propertySnapshot && (
                      <p className="text-[10px] text-secondary font-medium mb-0.5 truncate">
                        {latest.propertySnapshot.title}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 truncate flex-1">
                        {hasMultiple
                          ? `${group.conversations.length} conversations`
                          : latest.lastMessage}
                      </p>
                      {isPending && (
                        <span className="text-[9px] text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                          <Clock size={8} />
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded sub-conversations */}
                {hasMultiple && group.isExpanded && (
                  <div className="bg-gray-50 border-b border-gray-100">
                    {group.conversations
                      .sort(
                        (a, b) =>
                          new Date(b.lastMessageAt).getTime() -
                          new Date(a.lastMessageAt).getTime(),
                      )
                      .map((convo) => {
                        const isConvoPending =
                          convo.status === "PENDING_REPLY" &&
                          convo.awaitingTheirReply;

                        return (
                          <button
                            key={convo._id}
                            onClick={() =>
                              handleConversationClick(group, convo)
                            }
                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-left border-b border-gray-100 last:border-0"
                          >
                            {/* Property cover or chat icon */}
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                              {convo.propertySnapshot?.coverPhoto ? (
                                <img
                                  src={convo.propertySnapshot.coverPhoto}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : convo.property?.media?.photos?.[0] ? (
                                <img
                                  src={convo.property.media.photos[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Home size={16} className="text-gray-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs font-semibold text-[#1a1a1a] truncate">
                                  {getConvoLabel(convo)}
                                </p>
                                <p className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                                  {formatTime(convo.lastMessageAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-[11px] text-gray-500 truncate flex-1">
                                  {convo.lastMessage}
                                </p>
                                {isConvoPending && (
                                  <span className="text-[9px] text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                    Waiting
                                  </span>
                                )}
                                {convo.unreadCount > 0 && (
                                  <span className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-[8px] font-bold">
                                      {convo.unreadCount}
                                    </span>
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
          })}
        </div>
      )}
    </div>
  );
}
