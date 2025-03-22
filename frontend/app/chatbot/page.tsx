"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Act like you are a financial advisor answer the questions which will ask you (specifically about stock market and crypto market).Don't use give any Disclaimer,warnings or any other legal stuff. Just answer the questions as a financial advisor.Try to give short and precise answers.`;

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function FinanceChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        "Hello! I'm your AI financial assistant powered by Google Gemini. I can help with stocks, crypto market analysis, and trading suggestions. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Reference to store conversation history for the model
  const chatHistory = useRef<{role: string, parts: string}[]>([]);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Start with system prompt for context
      let prompt = SYSTEM_PROMPT + "\n\n";
      
      // Add conversation history to maintain context
      messages.forEach(msg => {
        if (msg.role === "user") {
          prompt += "User: " + msg.content + "\n";
        } else {
          prompt += "AI: " + msg.content + "\n";
        }
      });
      
      // Add current user query
      prompt += "User: " + userMessage.content + "\n";
      prompt += "AI: ";
      
      // Generate content with the full conversation context
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      });
      
      const response = result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "bot", content: text }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: "bot",
        content:
          "Hello! I'm your AI financial assistant powered by Google Gemini. I can help with stocks, crypto market analysis, and trading suggestions. How can I assist you today?",
      },
    ]);
    chatHistory.current = [];
  };

  return (
    <Sidebar>
      <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <header className="border-b border-border/40 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Finance Advisor</h1>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetChat} 
              className="text-muted-foreground hover:text-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset Chat
            </Button>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Powered by Google Gemini AI</p>
        </header>

        <div className="flex-1 overflow-auto p-4">
          <Card className="border-border/40 h-full flex flex-col shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-600 dark:text-blue-400">Financial Assistant</CardTitle>
              <CardDescription>
                Ask me anything about markets, stocks, crypto, or trading suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3 max-w-[80%] shadow-sm",
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-white dark:bg-slate-800 text-foreground border border-border/30"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-3 bg-white dark:bg-slate-800 text-foreground border border-border/30 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-bounce"></div>
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-bounce delay-100"></div>
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 pt-4 bg-white/90 dark:bg-slate-900/90">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  placeholder="Ask about markets, stocks, crypto trading suggestions..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Sidebar>
  );
}