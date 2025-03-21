"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! I'm FinChatbot, your AI financial assistant. How can I help you today?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate bot response
    setTimeout(() => {
      let response = ""

      if (input.toLowerCase().includes("bitcoin") || input.toLowerCase().includes("crypto")) {
        response =
          "Bitcoin is currently trading at $68,245.12, down 2.15% in the last 24 hours. The overall crypto market is showing mixed signals today. Ethereum is up 0.63% while Solana has gained 8.45% in the last 24 hours."
      } else if (input.toLowerCase().includes("stock") || input.toLowerCase().includes("market")) {
        response =
          "The S&P 500 is up 1.23% today, with technology and healthcare sectors leading the gains. NASDAQ is up 0.87%. Top performers include NVIDIA (+5.63%) and Tesla (+4.21%). Would you like more specific information about any particular stock?"
      } else if (input.toLowerCase().includes("portfolio") || input.toLowerCase().includes("investment")) {
        response =
          "Your portfolio is currently valued at $124,532.89, up 1.01% today. Your asset allocation is 60% stocks and 40% cryptocurrencies. Would you like to see a detailed breakdown or get recommendations for rebalancing?"
      } else if (
        input.toLowerCase().includes("trade") ||
        input.toLowerCase().includes("buy") ||
        input.toLowerCase().includes("sell")
      ) {
        response =
          "I can help you analyze potential trades. Please specify which asset you're interested in trading, and I can provide market analysis, technical indicators, and sentiment analysis to help inform your decision."
      } else {
        response =
          "I'm analyzing the markets now. Based on current trends, technology stocks are showing strong momentum, with NVIDIA leading gains at +5.63%. In the crypto space, Solana is outperforming with +8.45% gains. Would you like more specific information about any particular asset or market sector?"
      }

      setMessages((prev) => [...prev, { role: "bot", content: response }])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <>
    <Sidebar>
    <div className="flex flex-col h-full">
      <header className="border-b border-border/40 p-4">
        <h1 className="text-2xl font-bold">FinChatbot</h1>
        <p className="text-muted-foreground">Your AI-powered financial assistant</p>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <Card className="bg-gradient-card border-border/40 h-full flex flex-col">
          <CardHeader>
            <CardTitle>Financial Assistant</CardTitle>
            <CardDescription>Ask me anything about markets, stocks, crypto, or your portfolio</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      message.role === "user" ? "bg-blue-500 text-white" : "bg-muted text-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-2 bg-muted text-foreground">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-100"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/40 pt-4">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Ask about markets, stocks, crypto, or your portfolio..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
    </Sidebar></>
  )
}

