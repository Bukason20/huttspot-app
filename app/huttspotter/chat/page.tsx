"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const activeContacts = [
  {
    id: 1,
    name: "Agent Co",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    isOnline: true,
  },
  {
    id: 2,
    name: "NYSC",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    isOnline: true,
  },
  {
    id: 3,
    name: "Rivers Uni",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    isOnline: false,
  },
];

const conversations = [
  {
    id: 1,
    name: "Eva Agent",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Nice to meet you too",
    time: "3 min",
  },
  {
    id: 2,
    name: "Lianan",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    lastMessage: "Hi",
    time: "17 min",
  },
  {
    id: 3,
    name: "Jane",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    lastMessage: "Good morning",
    time: "40 min",
  },
  {
    id: 4,
    name: "Veena Agent",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    lastMessage: "Hi how are you doing",
    time: "55 min",
  },
  {
    id: 5,
    name: "Love",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg",
    lastMessage: "Hi how are you doing",
    time: "Tuesday",
  },
  {
    id: 6,
    name: "Jennifer",
    avatar: "https://randomuser.me/api/portraits/women/71.jpg",
    lastMessage: "I get off work soon",
    time: "Wednesday",
  },
  {
    id: 7,
    name: "Queen",
    avatar: "https://randomuser.me/api/portraits/women/88.jpg",
    lastMessage: "Hello there",
    time: "Wednesday",
  },
];

export default function HuttspotterChatPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-5 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Chat</h1>
      </div>

      {/* Active contacts */}
      <div className="flex items-center gap-4 px-5 mb-4">
        {activeContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => router.push(`/huttspotter/chat/${contact.id}`)}
            className="relative cursor-pointer flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full border-2 border-secondary p-0.5">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {contact.isOnline && (
              <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
            )}
          </button>
        ))}
        <button className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center cursor-pointer flex-shrink-0">
          <Plus size={22} className="text-primary" />
        </button>
      </div>

      <div className="h-px bg-gray-100 mx-5 mb-2" />

      {/* Conversations */}
      <div className="flex flex-col">
        {conversations.map((convo) => (
          <button
            key={convo.id}
            onClick={() => router.push(`/huttspotter/chat/${convo.id}`)}
            className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors text-left"
          >
            <img
              src={convo.avatar}
              alt={convo.name}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-bold text-[#1a1a1a]">{convo.name}</p>
                <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {convo.time}
                </p>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {convo.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
