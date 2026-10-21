import api from "./api";

// ── Types ──────────────────────────────────────────────────────

export interface Participant {
  _id: string;
  name: string;
  profilePhoto?: string;
  accountMode: "AGENT" | "HUTTSPOTTER";
}

export interface PropertySnapshot {
  propertyId: string;
  title: string;
  price: number;
  paymentType: string;
  purpose: string;
  coverPhoto?: string;
  city?: string;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  initiator: string;
  awaitingReplyFrom: string;
  status: "PENDING_REPLY" | "ACTIVE" | "ARCHIVED";
  property?: {
    _id: string;
    title: string;
    type: string;
    price: number;
    paymentType: string;
    purpose: string;
    isPublished: boolean;
    media?: { photos: string[] };
    location?: { city: string; state: string };
  } | null;
  propertySnapshot?: PropertySnapshot;
  lastMessage: string;
  lastMessageAt: string;
  lastSender: string;
  unreadCount: number;
  awaitingMyReply: boolean;
  awaitingTheirReply: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  type: "TEXT" | "INQUIRY";
  property?: string;
  propertySnapshot?: PropertySnapshot;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessagesResponse {
  conversation: Conversation;
  messages: Message[];
  hasMore: boolean;
}

export interface InquireResponse {
  message: string;
  isNewContext: boolean; // true = property context switched
  conversation: Conversation;
  firstMessage: Message;
}

// ── Helper ─────────────────────────────────────────────────────

export function getOtherParticipant(
  conversation: Conversation,
  myUserId: string,
): Participant | undefined {
  return conversation.participants.find((p) => p._id !== myUserId);
}

// ── Endpoints ──────────────────────────────────────────────────

/**
 * GET /api/chat/conversations
 * One row per person. Pass pending=true for agent's pending tab.
 */
export async function getConversations(params?: {
  pending?: boolean;
  status?: "PENDING_REPLY" | "ACTIVE" | "ARCHIVED";
}): Promise<Conversation[]> {
  const response = await api.get<Conversation[]>("/api/chat/conversations", {
    params,
  });
  return response.data;
}

/**
 * GET /api/chat/{conversationId}/messages
 * Returns conversation header + paginated messages (oldest → newest)
 */
export async function getConversationMessages(
  conversationId: string,
  params?: { before?: string; limit?: number },
): Promise<ConversationMessagesResponse> {
  const response = await api.get<ConversationMessagesResponse>(
    `/api/chat/${conversationId}/messages`,
    { params },
  );
  return response.data;
}

/**
 * POST /api/chat/inquire
 * Send inquiry. isNewContext=true means property context switched.
 */
export async function sendInquiry(
  propertyId: string,
  message: string,
): Promise<InquireResponse> {
  const response = await api.post<InquireResponse>("/api/chat/inquire", {
    propertyId,
    message,
  });
  return response.data;
}

/**
 * PATCH /api/chat/{conversationId}/read
 */
export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  await api.patch(`/api/chat/${conversationId}/read`);
}

/**
 * PATCH /api/chat/{conversationId}/archive
 */
export async function archiveConversation(
  conversationId: string,
): Promise<{ message: string; conversation: Conversation }> {
  const response = await api.patch(`/api/chat/${conversationId}/archive`);
  return response.data;
}
