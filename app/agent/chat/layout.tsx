"use client";

import ChatWorkspace from "@/components/chat/ChatWorkspace";

// Keeps the conversation list on screen while moving between chats (desktop)
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatWorkspace role="AGENT">{children}</ChatWorkspace>;
}
