"use client";

import { useState } from "react";

type Message = {
  content: string;
  isUser: boolean;
};

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState("");
  const [conversation, setConversation] = useState<Message[]>([
    { content: "Hello! How can I help you with your energy consumption today?", isUser: false }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    setLoading(true);
    
    // Ajouter le message de l'utilisateur à la conversation
    setConversation(prev => [...prev, { content: inputMessage, isUser: true }]);
    
    try {
      const res = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appliance_list: inputMessage, // Adaptez selon vos besoins
          efficiency_feedback: "", // Ajoutez des champs supplémentaires si nécessaire
          user_location: userLocation,
        }),
      });

      const data = await res.json();
      
      setConversation(prev => [
        ...prev, 
        { content: data.model_response || data.error, isUser: false }
      ]);
      
    } catch (error: any) {
      setConversation(prev => [
        ...prev, 
        { content: `Error: ${error.message}`, isUser: false }
      ]);
    }
    
    setInputMessage("");
    setLoading(false);
  };

  // Energy Efficiency Advisor - Enhanced UI Component
return (
  <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-xl p-4 w-full max-w-2xl flex flex-col h-[75vh] border border-blue-100">
    <header className="mb-4">
      <h1 className="text-2xl font-bold text-center text-blue-800 flex items-center justify-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Energy AI Advisor
      </h1>
    </header>

    <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-1 scrollbar-thin">
      {conversation.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
              msg.isUser
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-800 border border-gray-100"
            }`}
          >
            <p className="whitespace-pre-line text-base">{msg.content}</p>
          </div>
        </div>
      ))}
    </div>

    <form onSubmit={handleSubmit} className="mt-auto">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <div className="relative w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              placeholder="Your country"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full border border-gray-200 rounded-lg py-2 px-4 pr-16 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              disabled={loading}
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bg-blue-600 text-white rounded-lg px-3 py-1 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending
                </span>
              ) : (
                <span className="flex items-center">
                  Send
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
  );
}