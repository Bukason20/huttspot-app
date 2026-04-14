"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

// Temporary mock data — replace with API data later
const activeContacts = [
  {
    id: 1,
    name: "NYSC",
    avatar:
      "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/NYSC_logo.png/200px-NYSC_logo.png",
    isOnline: true,
  },
  {
    id: 2,
    name: "Rivers Uni",
    avatar:
      "https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/RSUST_logo.png/200px-RSUST_logo.png",
    isOnline: true,
  },
  {
    id: 3,
    name: "Agent Co.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    isOnline: true,
  },
];

const conversations = [
  {
    id: 1,
    name: "Eva John",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Hi how are you doing",
    property: "Modern Apartment, PH",
    time: "2 hrs ago",
  },
  {
    id: 2,
    name: "Ebuka",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Hi, I'm interested in your listing. Is it...",
    property: "2 bed room GRA, PH",
    time: "4 hrs ago",
  },
  {
    id: 3,
    name: "Veena Oge",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    lastMessage: "Hello",
    property: "Self con. Rumudara, PH",
    time: "4 hrs ago",
  },
  {
    id: 4,
    name: "Emma",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    lastMessage: "Hi how are you doing",
    property: "Modern Apartment, Lagos",
    time: "12 hrs ago",
  },
  {
    id: 5,
    name: "Chinedu Okafor",
    avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    lastMessage: "Hi, I'm interested in a Inspection...",
    property: "2 bed room, PH",
    time: "12 hrs ago",
  },
  {
    id: 6,
    name: "Love. E",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    lastMessage: "Hi how are you doing",
    property: "Modern Apartment, PH",
    time: "18 hrs ago",
  },
];

export default function AgentChatPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-4 pb-6">
        <button onClick={() => router.back()} className="cursor-pointer">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-[#1a1a1a] flex-1 text-center pr-6">
          Chat
        </h1>
      </div>

      {/* Active contacts row */}
      <div className="flex items-center gap-4 px-5 mb-6">
        {activeContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => router.push(`/agent/chat/${contact.id}`)}
            className="flex flex-col items-center gap-1 cursor-pointer relative flex-shrink-0"
          >
            {/* Avatar with green ring */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-secondary p-0.5">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {/* Online dot */}
              {contact.isOnline && (
                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>
          </button>
        ))}

        {/* Add new contact button */}
        <button className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center cursor-pointer flex-shrink-0">
          <Plus size={22} className="text-primary" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-5 mb-2" />

      {/* Conversations list */}
      <div className="flex flex-col">
        {conversations.map((convo) => (
          <button
            key={convo.id}
            onClick={() => router.push(`/agent/chat/${convo.id}`)}
            className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors text-left"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={convo.avatar}
                alt={convo.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-bold text-[#1a1a1a]">{convo.name}</p>
                <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {convo.time}
                </p>
              </div>
              <p className="text-xs text-gray-500 truncate mb-0.5">
                {convo.lastMessage}
              </p>
              <p className="text-xs text-gray-400">
                Property: {convo.property}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
