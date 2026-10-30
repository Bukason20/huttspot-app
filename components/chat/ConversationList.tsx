"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Clock, MessageCircle, Search, X } from "lucide-react";
import {
  getConversations,
  archiveConversation,
  getOtherParticipant,
  Conversation,
  Message,
} from "@/lib/chat";
import { getSocket } from "@/lib/socket";
import { useUser } from "@/context/UserContext";
import { Avatar, formatListTime } from "./chatUtils";

type Tab = "all" | "pending";

function ListSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-1 p-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl p-3">
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex justify-between">
              <div className="h-3 w-28 rounded-full bg-gray-200" />
              <div className="h-2.5 w-10 rounded-full bg-gray-200" />
            </div>
            <div className="h-2.5 w-20 rounded-full bg-gray-200" />
            <div className="h-2.5 w-3/4 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  role: "HUTTSPOTTER" | "AGENT";
  basePath: string; // "/huttspotter/chat" | "/agent/chat"
  activeId: string | null;
}

export default function ConversationList({ role, basePath, activeId }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const isAgent = role === "AGENT";

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [pendingConversations, setPendingConversations] = useState<
    Conversation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [query, setQuery] = useState("");
  const allRef = useRef<Conversation[]>([]);
  allRef.current = allConversations;

  // Load all conversations on mount
  // (no filter — one row per person, already deduplicated by backend)
  const fetchAll = async () => {
    try {
      const data = await getConversations();
      setAllConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Agent: load pending when the tab switches to pending (?pending=true)
  useEffect(() => {
    if (!isAgent) return;
    if (activeTab !== "pending" || pendingConversations.length > 0) return;
    const fetch = async () => {
      setPendingLoading(true);
      try {
        const data = await getConversations({ pending: true });
        setPendingConversations(data);
      } catch (err) {
        console.error("Failed to fetch pending:", err);
      } finally {
        setPendingLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Opening a conversation marks it read — reflect that in the list
  useEffect(() => {
    if (!activeId) return;
    const clear = (list: Conversation[]) =>
      list.map((c) => (c._id === activeId ? { ...c, unreadCount: 0 } : c));
    setAllConversations(clear);
    setPendingConversations(clear);
  }, [activeId]);

  // Keep previews fresh while chatting (the list stays on screen on desktop)
  useEffect(() => {
    const socket = getSocket();

    const onMessage = (message: Message) => {
      // A brand-new conversation: reload the list instead
      if (!allRef.current.some((c) => c._id === message.conversation)) {
        fetchAll();
        return;
      }
      const bump = (list: Conversation[]) => {
        const i = list.findIndex((c) => c._id === message.conversation);
        if (i === -1) return list;
        const c = list[i];
        const fromMe = message.sender === user?.id;
        const updated: Conversation = {
          ...c,
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          lastSender: message.sender,
          unreadCount:
            fromMe || message.conversation === activeId
              ? c.unreadCount
              : c.unreadCount + 1,
        };
        return [updated, ...list.slice(0, i), ...list.slice(i + 1)];
      };
      setAllConversations(bump);
      setPendingConversations(bump);
    };

    const onUpdated = (updated: Conversation) => {
      const merge = (list: Conversation[]) =>
        list.map((c) =>
          c._id === updated._id
            ? {
                ...c,
                ...updated,
                // keep the "for me" fields the list endpoint computed
                participants: updated.participants?.length
                  ? updated.participants
                  : c.participants,
                unreadCount:
                  updated._id === activeId ? 0 : c.unreadCount,
              }
            : c,
        );
      setAllConversations(merge);
      setPendingConversations(merge);
    };

    socket.on("receiveMessage", onMessage);
    socket.on("conversationUpdated", onUpdated);
    return () => {
      socket.off("receiveMessage", onMessage);
      socket.off("conversationUpdated", onUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeId]);

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
      if (conversationId === activeId) router.push(basePath);
    } catch (err) {
      console.error("Failed to archive:", err);
    }
  };

  const pendingCount = allConversations.filter((c) => c.awaitingMyReply).length;
  const source =
    isAgent && activeTab === "pending" ? pendingConversations : allConversations;
  const isLoadingActive =
    isAgent && activeTab === "pending" ? pendingLoading : loading;

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!q) return source;
    return source.filter((c) => {
      const other = getOtherParticipant(c, user?.id ?? "");
      return [other?.name, c.propertySnapshot?.title, c.lastMessage]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [source, q, user?.id]);

  const totalUnread = allConversations.reduce(
    (n, c) => n + (c.unreadCount || 0),
    0,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="px-4 pb-3 pt-5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-poppins text-2xl font-semibold tracking-tight">
            Messages
          </h1>
          {totalUnread > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {totalUnread} unread
            </span>
          )}
        </div>

        <div className="mt-4 flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-[#f7f7f5] px-4 transition-colors focus-within:border-secondary">
          <Search size={17} className="flex-shrink-0 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAgent ? "Search people or listings" : "Search agents or listings"}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Agent tabs — All | Needs reply */}
        {isAgent && (
          <div
            role="tablist"
            className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-[#f2f2f0] p-1"
          >
            {(
              [
                { key: "all", label: "All" },
                { key: "pending", label: "Needs reply" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className={`flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === key
                    ? "bg-white text-[#1a1a1a] shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {label}
                {key === "pending" && pendingCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold leading-4 text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 pb-3 sm:px-3">
        {isLoadingActive ? (
          <ListSkeleton />
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f7f5]">
              <MessageCircle size={24} className="text-gray-400" />
            </span>
            <p className="mt-4 font-semibold">
              {q
                ? "No matches"
                : isAgent && activeTab === "pending"
                  ? "You're all caught up"
                  : "No conversations yet"}
            </p>
            <p className="mt-1 max-w-[240px] text-sm text-gray-500">
              {q
                ? "Try a different name or listing."
                : isAgent
                  ? activeTab === "pending"
                    ? "Inquiries waiting for your reply show up here."
                    : "When huttspotters contact you about a listing, it shows up here."
                  : "Tap “Contact Agent” on a listing to start a conversation."}
            </p>
            {!q && !isAgent && (
              <button
                onClick={() => router.push("/huttspotter/listings")}
                className="mt-5 h-10 cursor-pointer rounded-full bg-secondary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#08744a]"
              >
                Browse listings
              </button>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {visible.map((convo) => {
              const other = getOtherParticipant(convo, user?.id ?? "");
              const isActive = convo._id === activeId;
              const unread = convo.unreadCount > 0 && !isActive;
              const lastFromMe = convo.lastSender === user?.id;

              return (
                <li key={convo._id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`${basePath}/${convo._id}`)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && router.push(`${basePath}/${convo._id}`)
                    }
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-colors ${
                      isActive ? "bg-[#f7f7f5]" : "hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-y-3 left-0 w-1 rounded-full bg-secondary" />
                    )}
                    <div className="relative">
                      <Avatar person={other} size={48} />
                      {unread && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-[10px] font-bold text-white">
                          {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={`truncate text-[15px] ${
                            unread ? "font-extrabold" : "font-bold"
                          }`}
                        >
                          {other?.name ?? (isAgent ? "User" : "Agent")}
                        </p>
                        <span
                          className={`flex-shrink-0 text-xs ${
                            unread ? "font-bold text-primary" : "text-gray-400"
                          }`}
                        >
                          {formatListTime(convo.lastMessageAt)}
                        </span>
                      </div>

                      {convo.propertySnapshot && (
                        <p className="truncate text-xs font-semibold text-secondary">
                          {convo.propertySnapshot.title}
                        </p>
                      )}

                      <div className="mt-0.5 flex items-center gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-sm ${
                            unread ? "font-semibold text-[#1a1a1a]" : "text-gray-500"
                          }`}
                        >
                          {lastFromMe && (
                            <span className="text-gray-400">You: </span>
                          )}
                          {convo.lastMessage}
                        </p>

                        {/* huttspotter waiting on the agent */}
                        {!isAgent && convo.awaitingTheirReply && (
                          <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            <Clock size={10} /> Waiting
                          </span>
                        )}
                        {/* agent needs to respond */}
                        {isAgent && convo.awaitingMyReply && (
                          <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-white">
                            <Clock size={10} /> Reply
                          </span>
                        )}
                      </div>
                    </div>

                    {isAgent && (
                      <button
                        onClick={(e) => handleArchive(e, convo._id)}
                        title="Archive"
                        aria-label="Archive conversation"
                        className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-[#1a1a1a] lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100"
                      >
                        <Archive size={15} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
