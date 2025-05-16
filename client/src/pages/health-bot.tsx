import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HealthBotPage() {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  interface ChatMessage {
    id: number;
    userId: string;
    message: string;
    isUserMessage: boolean;
    timestamp: string;
  }

  interface FrequentQuestion {
    text: string;
  }

  const { data: chatHistory = [] as ChatMessage[] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat-history"],
  });

  const { data: frequentQuestions = [] as FrequentQuestion[] } = useQuery<FrequentQuestion[]>({
    queryKey: ["/api/health-bot/frequent-questions"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-history"] });
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Send a suggested question
  const handleSendSuggestedQuestion = (question: string) => {
    sendMessageMutation.mutate(question);
  };

  return (
    <>
      <Helmet>
        <title>Health Bot | NutriPlan</title>
        <meta name="description" content="Ask our AI health specialist any questions about nutrition, diet, or fitness. Get personalized advice based on your goals." />
      </Helmet>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold gradient-text">Health Specialist</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-14rem)] rounded-xl shadow-md border-0">
              <CardHeader className="border-b p-5">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-purple-500" />
                  Chat with Health Specialist
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-full">
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="text-center p-8 max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-10 w-10 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3 gradient-text">Welcome to Health Bot</h3>
                        <p className="text-gray-500 mb-6 dark:text-gray-400">
                          Ask me any questions about nutrition, diet, or fitness. I'm here to help you achieve your health goals!
                        </p>
                        <Button 
                          variant="default" 
                          className="rounded-full gradient-button px-6 py-2 font-medium shadow-sm"
                          onClick={() => handleSendSuggestedQuestion("What nutrition advice do you offer?")}
                        >
                          Get Started
                        </Button>
                      </div>
                    </div>
                  ) : (
                    chatHistory.map((chat, index) => (
                      <div 
                        key={chat.id || index} 
                        className={cn(
                          "flex", 
                          chat.isUserMessage ? "justify-end" : "justify-start"
                        )}
                      >
                        <div 
                          className={cn(
                            "rounded-2xl p-4 max-w-[80%] shadow-sm",
                            chat.isUserMessage 
                              ? "gradient-chat-bubble text-white" 
                              : "bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
                          )}
                        >
                          <div className="whitespace-pre-wrap">{chat.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form 
                  onSubmit={handleSendMessage}
                  className="p-5 border-t"
                >
                  <div className="flex space-x-3">
                    <Input
                      type="text"
                      placeholder="Type your question..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 rounded-full border-gray-200 focus-visible:ring-purple-500 dark:border-gray-700"
                    />
                    <Button 
                      type="submit"
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                      className="rounded-full gradient-button px-5"
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="gradient-spinner mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="rounded-xl shadow-md border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Info className="h-5 w-5 mr-2 text-purple-500" />
                  Suggested Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {frequentQuestions.length > 0 ? (
                    frequentQuestions.map((question: any, index: number) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-2.5 px-4 rounded-lg border-gray-200 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 transition-all duration-200"
                        onClick={() => handleSendSuggestedQuestion(question.text)}
                      >
                        {question.text}
                      </Button>
                    ))
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-2.5 px-4 rounded-lg border-gray-200 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 transition-all duration-200"
                        onClick={() => handleSendSuggestedQuestion("What are some low-carb breakfast ideas?")}
                      >
                        What are some low-carb breakfast ideas?
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-2.5 px-4 rounded-lg border-gray-200 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 transition-all duration-200"
                        onClick={() => handleSendSuggestedQuestion("How much protein do I need daily?")}
                      >
                        How much protein do I need daily?
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-2.5 px-4 rounded-lg border-gray-200 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 transition-all duration-200"
                        onClick={() => handleSendSuggestedQuestion("What foods are good for weight loss?")}
                      >
                        What foods are good for weight loss?
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-2.5 px-4 rounded-lg border-gray-200 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 transition-all duration-200"
                        onClick={() => handleSendSuggestedQuestion("How can I meal prep for the week?")}
                      >
                        How can I meal prep for the week?
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left h-auto py-2.5 px-4 rounded-lg border-gray-200 hover:border-purple-200 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 transition-all duration-200"
                        onClick={() => handleSendSuggestedQuestion("What should I eat before and after a workout?")}
                      >
                        What should I eat before and after a workout?
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6 rounded-xl shadow-md border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg gradient-text">Health Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl gradient-border">
                    <h3 className="font-semibold mb-1.5 text-purple-700 dark:text-purple-300">Stay Hydrated</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Aim to drink at least 2-3 liters of water daily for optimal health.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl gradient-border">
                    <h3 className="font-semibold mb-1.5 text-purple-700 dark:text-purple-300">Eat Colorful Meals</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Include a variety of colorful fruits and vegetables in your diet for a range of nutrients.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl gradient-border">
                    <h3 className="font-semibold mb-1.5 text-purple-700 dark:text-purple-300">Regular Meal Times</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Maintain consistent meal times to support your metabolism and energy levels.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
