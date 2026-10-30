"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import ConversationList from "./ConversationList";

/**
 * Two-pane chat: conversation list + open conversation.
 * - lg and up: one card, list on the left, conversation on the right.
 * - Smaller screens: the list is the page; a conversation opens full screen.
 */
export default function ChatWorkspace({
  role,
  children,
}: {
  role: "HUTTSPOTTER" | "AGENT";
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const basePath = role === "AGENT" ? "/agent/chat" : "/huttspotter/chat";
  const activeId = pathname.startsWith(basePath + "/")
    ? pathname.slice(basePath.length + 1).split("/")[0] || null
    : null;

  return (
    <div className="px-5 lg:px-0">
      <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white lg:grid lg:h-[calc(100dvh-5rem)] lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside
          className={`min-h-0 flex-col border-gray-100 lg:flex lg:border-r ${
            activeId ? "hidden" : "flex"
          }`}
        >
          <ConversationList role={role} basePath={basePath} activeId={activeId} />
        </aside>
        <section className="flex min-h-0 min-w-0 flex-col">{children}</section>
      </div>
    </div>
  );
}

/** Right-hand placeholder on desktop when no conversation is open */
export function ChatEmptyState({ role }: { role: "HUTTSPOTTER" | "AGENT" }) {
  return (
    <div className="hidden h-full flex-col items-center justify-center bg-[#f7f7f5] px-8 text-center lg:flex">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
        <MessageCircle size={26} className="text-secondary" />
      </span>
      <h2 className="mt-5 font-poppins text-xl font-semibold">
        Pick a conversation
      </h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-gray-500">
        {role === "AGENT"
          ? "Choose a chat on the left to reply to huttspotters asking about your listings."
          : "Choose a chat on the left to continue talking with an agent about a property."}
      </p>
    </div>
  );
}
