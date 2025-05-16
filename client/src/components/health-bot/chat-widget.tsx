import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: chatHistory = [] } = useQuery({
    queryKey: ["/api/chat-history"],
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", "/api/chat", {
        userId: user?.id,
        message,
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-history"] });
      setNewMessage("");
    },
  });

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-10">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg w-72 overflow-hidden border border-gray-200 dark:bg-dark-card dark:border-gray-700" style={{ height: "400px" }}>
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <h3 className="font-medium">Health Specialist</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-gray-200 h-auto p-0"
              onClick={() => setIsOpen(false)}
            >
              ×
            </Button>
          </div>

          <div className="p-4 h-72 overflow-y-auto bg-gray-50 dark:bg-gray-800" id="chat-messages">
            {chatHistory.length === 0 ? (
              <div className="mb-3">
                <div className="bg-gray-200 rounded-lg p-3 inline-block max-w-3/4 dark:bg-gray-700 dark:text-white">
                  <p className="text-sm">Hi there! I'm your health specialist assistant. How can I help you today?</p>
                </div>
              </div>
            ) : (
              chatHistory.map((chat: any, index: number) => (
                <div 
                  key={chat.id || index} 
                  className={cn(
                    "mb-3", 
                    chat.isUserMessage ? "text-right" : ""
                  )}
                >
                  <div 
                    className={cn(
                      "rounded-lg p-3 inline-block max-w-3/4",
                      chat.isUserMessage 
                        ? "bg-primary text-white" 
                        : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                    )}
                  >
                    <p className="text-sm">{chat.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form 
            onSubmit={handleSendMessage}
            className="p-3 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your question..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button 
                type="submit"
                size="icon"
                disabled={sendMessageMutation.isPending || !newMessage.trim()}
                className="p-2 bg-primary text-white rounded-md"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button
          variant="default"
          size="icon"
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-green-600 focus:outline-none float-right h-14 w-14"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
