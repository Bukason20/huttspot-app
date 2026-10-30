"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getConversations, Message } from "./chat";
import { getSocket } from "./socket";

/**
 * Unread chat messages for the sidebar / bottom-nav badges.
 *
 * One shared store for every badge on the page:
 * - loads GET /api/chat/conversations and adds up `unreadCount`
 * - reloads whenever the page changes (e.g. after reading a chat)
 * - goes up live when a message arrives through the socket
 * - the conversation that is open on screen never counts (it's being read)
 */

let counts: Record<string, number> = {};
let myId: string | null = null;
let activeId: string | null = null;
let inflight: Promise<void> | null = null;
let socketBound = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function total(): number {
  return Object.entries(counts).reduce(
    (n, [id, c]) => (id === activeId ? n : n + (c || 0)),
    0,
  );
}

function reload(): Promise<void> {
  if (typeof window === "undefined" || !localStorage.getItem("token")) {
    return Promise.resolve();
  }
  if (inflight) return inflight;
  inflight = getConversations()
    .then((list) => {
      counts = Object.fromEntries(list.map((c) => [c._id, c.unreadCount || 0]));
      emit();
    })
    .catch((err) => console.error("Failed to load unread chats:", err))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function bindSocket() {
  if (socketBound || typeof window === "undefined") return;
  if (!localStorage.getItem("token")) return;
  socketBound = true;
  const socket = getSocket();
  socket.on("receiveMessage", (message: Message) => {
    if (message.sender === myId) return; // my own message
    if (message.conversation === activeId) return; // open on screen
    if (message.conversation in counts) {
      counts = {
        ...counts,
        [message.conversation]: (counts[message.conversation] || 0) + 1,
      };
      emit();
    } else {
      reload(); // a new conversation
    }
  });
  socket.on("disconnect", () => {
    socketBound = false; // a new socket is created on reconnect
  });
}

/** Total unread messages. `basePath` is "/huttspotter/chat" or "/agent/chat". */
export function useUnreadChats(basePath: string, userId?: string): number {
  const pathname = usePathname() ?? "";
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(total());
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);

  useEffect(() => {
    if (userId) myId = userId;
  }, [userId]);

  // Track the open conversation and refresh counts on every page change
  useEffect(() => {
    const next = pathname.startsWith(basePath + "/")
      ? pathname.slice(basePath.length + 1).split("/")[0] || null
      : null;
    if (next !== activeId) {
      // Leaving a conversation: it has been read
      if (activeId && activeId in counts) counts = { ...counts, [activeId]: 0 };
      activeId = next;
      emit();
    }
    bindSocket();
    reload();
  }, [pathname, basePath]);

  return count;
}

export function formatBadge(n: number): string {
  return n > 99 ? "99+" : String(n);
}
