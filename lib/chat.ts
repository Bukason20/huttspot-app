import api from "./api";

// ── Types ──────────────────────────────────────────────────────

export interface Participant {
  _id: string;
  name: string;
  profilePhoto?: string;
  accountMode: "AGENT" | "HUTTSPOTTER";
}

export interface PropertySnapshot {
  title: string;
  price: number;
  paymentType: string;
  purpose: string;
  coverPhoto?: string;
  city?: string;
}

export interface ConversationProperty {
  _id: string;
  title: string;
  type: string;
  price: number;
  paymentType: string;
  purpose: string;
  isPublished: boolean;
  media?: { photos: string[] };
  location?: { city: string; state: string };
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  initiator: string;
  type: "PROPERTY_INQUIRY" | "DIRECT";
  status: "PENDING_REPLY" | "ACTIVE" | "ARCHIVED";
  property?: ConversationProperty | null;
  propertySnapshot?: PropertySnapshot;
  lastMessage: string;
  lastMessageAt: string;
  lastSender: string;
  unreadCount: number;
  awaitingMyReply: boolean; // ← I need to reply
  awaitingTheirReply: boolean; // ← waiting for their reply
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  type: "TEXT" | "INQUIRY";
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
  conversation: Conversation;
  firstMessage: Message;
}

// ── Helpers ────────────────────────────────────────────────────

/**
 * Get the other participant in a conversation (not the current user)
 */
export function getOtherParticipant(
  conversation: Conversation,
  myUserId: string,
): Participant | undefined {
  return conversation.participants.find((p) => p._id !== myUserId);
}

// ── Endpoints ──────────────────────────────────────────────────

/**
 * GET /api/chat/conversations
 * Returns ALL conversations — pending inquiries + active chats
 * Filter by type/status for specific views
 */
export async function getConversations(params?: {
  type?: "PROPERTY_INQUIRY" | "DIRECT";
  status?: "PENDING_REPLY" | "ACTIVE" | "ARCHIVED";
}): Promise<Conversation[]> {
  const response = await api.get<Conversation[]>("/api/chat/conversations", {
    params,
  });
  return response.data;
}

/**
 * GET /api/chat/{conversationId}/messages
 * Returns conversation header + paginated messages
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
 * Send an inquiry about a property — creates or continues a conversation
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
 * Mark all messages in a conversation as read
 */
export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  await api.patch(`/api/chat/${conversationId}/read`);
}

/**
 * PATCH /api/chat/{conversationId}/archive
 * Archive a conversation (replaces old dismiss inquiry)
 */
export async function archiveConversation(
  conversationId: string,
): Promise<{ message: string; conversation: Conversation }> {
  const response = await api.patch(`/api/chat/${conversationId}/archive`);
  return response.data;
}
