"use client";
import { useState } from "react";

type Message = {
  content: string;
  isUser: boolean;
};

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex flex-col items-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-3xl flex flex-col h-[80vh]">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Energy Efficiency Advisor
        </h1>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  msg.isUser
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={userLocation}
              onChange={(e) => setUserLocation(e.target.value)}
              placeholder="Enter your location (e.g., fr)"
              className="flex-1 border rounded-lg p-2"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}