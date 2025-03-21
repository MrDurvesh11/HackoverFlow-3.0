"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! I'm FinChatbot, your AI financial assistant. How can I help you today?" },
  ])
  const [input, setInput] = useState("")

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    setMessages([...messages, { role: "user", content: input }])

    // Simulate bot response
    setTimeout(() => {
      let response =
        "I'm analyzing the markets now. Based on current trends, it looks like tech stocks are showing strong momentum today."

      if (input.toLowerCase().includes("bitcoin") || input.toLowerCase().includes("crypto")) {
        response =
          "Bitcoin is currently trading at $68,245.12, down 2.15% in the last 24 hours. The overall crypto market is showing mixed signals today."
      } else if (input.toLowerCase().includes("stock") || input.toLowerCase().includes("market")) {
        response =
          "The S&P 500 is up 1.23% today, with technology and healthcare sectors leading the gains. Would you like more specific information about any particular stock?"
      }

      setMessages((prev) => [...prev, { role: "bot", content: response }])
    }, 1000)

    setInput("")
  }

  return (
    <>
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-0"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 md:w-96 shadow-xl border-border/40 bg-gradient-card">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-b border-border/40">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              FinChatbot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 h-80 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%] text-sm",
                      message.role === "user" ? "bg-blue-500 text-white" : "bg-muted text-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/40 p-3">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Ask about markets, stocks, crypto..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

