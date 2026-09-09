"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Smile, Send } from "lucide-react";

const mockMessages = [
  {
    id: 1,
    text: "Hi, is this apartment still available?",
    sender: "them",
    time: "10:30",
  },
  {
    id: 2,
    text: "Yes it is! Would you like to schedule a viewing?",
    sender: "me",
    time: "10:32",
  },
  {
    id: 3,
    text: "That would be great, when are you free?",
    sender: "them",
    time: "10:35",
  },
  {
    id: 4,
    text: "I'm available tomorrow afternoon from 2pm. Does that work for you?",
    sender: "me",
    time: "10:36",
  },
];

export default function ChatConversationPage() {
  const router = useRouter();
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text: input.trim(), sender: "me", time: "Now" },
    ]);
    setInput("");
  };

  return (
    <div className="max-w-[390px] mx-auto h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-white flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <button onClick={() => router.back()} className="cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <img
          src="https://randomuser.me/api/portraits/women/12.jpg"
          alt="Jane"
          className="w-10 h-10 rounded-full object-cover"
        />
        <p className="flex-1 text-base font-bold text-[#1a1a1a]">Jane</p>
        <button className="cursor-pointer text-gray-400">
          <Phone size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Date pill */}
        <div className="flex justify-center">
          <span className="bg-gray-300 text-gray-600 text-xs font-medium px-4 py-1 rounded-full">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender === "me" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.sender === "them" && (
              <img
                src="https://randomuser.me/api/portraits/women/12.jpg"
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            )}
            <div
              className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "me"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-gray-200 text-[#1a1a1a] rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-t border-gray-100">
        <button className="cursor-pointer text-gray-400">
          <Smile size={22} />
        </button>
        <input
          type="text"
          placeholder="Message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
        />
        <button
          onClick={handleSend}
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
            input.trim() ? "bg-secondary" : "bg-gray-200"
          }`}
        >
          <Send size={16} color={input.trim() ? "#fff" : "#9ca3af"} />
        </button>
      </div>
    </div>
  );
}
