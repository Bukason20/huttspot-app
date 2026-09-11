import api from "./api";

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  // Populated by frontend after fetching participant details
  otherParticipant?: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  readBy: string[];
  createdAt: string;
}

export interface Inquiry {
  _id: string;
  property: {
    _id: string;
    title: string;
    media?: { photos: string[] };
  };
  sender: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  message: string;
  status: "PENDING" | "REPLIED" | "DISMISSED";
  createdAt: string;
}

// ── Get all conversations for logged-in user ──────────────────
export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get("/chat/conversations");
  return response.data;
}

export async function getConversationById(conversationId: string) {
  const conversations = await getConversations(); // hits /chat/conversations
  return conversations.find((c) => c._id === conversationId); // picks out THIS one
}

// ── Get all messages in a conversation ────────────────────────
export async function getMessages(conversationId: string): Promise<Message[]> {
  const response = await api.get(`/chat/${conversationId}/messages`);
  return response.data;
}

// ── Send inquiry about a property (Huttspotter) ───────────────
export async function sendInquiry(
  propertyId: string,
  message: string,
): Promise<{ message: string }> {
  const response = await api.post(`/api/user/inquiry/${propertyId}`, {
    message,
  });
  return response.data;
}

// ── Get all inquiries (Agent) ─────────────────────────────────
export async function getAgentInquiries(): Promise<Inquiry[]> {
  const response = await api.get("/api/agent/inquiry");
  return response.data;
}

// ── Reply to inquiry — starts chat (Agent) ────────────────────
export async function replyToInquiry(
  inquiryId: string,
  replyText: string,
): Promise<{ message: string; conversationId: string }> {
  const response = await api.post(`/api/agent/inquiry/${inquiryId}/reply`, {
    replyText,
  });
  return response.data;
}

// ── Dismiss inquiry (Agent) ───────────────────────────────────
export async function dismissInquiry(
  inquiryId: string,
): Promise<{ message: string }> {
  const response = await api.patch(`/api/agent/inquiry/${inquiryId}/dismiss`);
  return response.data;
}
