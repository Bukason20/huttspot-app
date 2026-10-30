"use client";

import { ChatEmptyState } from "@/components/chat/ChatWorkspace";

// The conversation list lives in ./layout.tsx so it stays put between chats
export default function ChatPage() {
  return <ChatEmptyState role="HUTTSPOTTER" />;
}
