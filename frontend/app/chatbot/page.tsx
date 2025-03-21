"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"
import { GoogleGenerativeAI } from "@google/generative-ai"

const SYSTEM_PROMPT = `You are a financial advisor specializing in stocks and cryptocurrency trading. 
Provide helpful, accurate information and trading suggestions based on current market knowledge. 
Be specific with suggestions, including potential entry/exit points, risk management advice, 
and market analysis when relevant.`;



interface Message {
  role: "user" | "bot"
  content: string
}

export default function FinanceChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "bot", 
      content: "Hello! I'm your AI financial assistant powered by Google Gemini. I can help with stocks, crypto market analysis, and trading suggestions. How can I assist you today?"
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 800,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
    ]
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Query: ${input}`
      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()

      setMessages(prev => [...prev, { role: "bot", content: text }])
    } catch (error) {
      console.error("Error:", error)
      setMessages(prev => [...prev, { 
        role: "bot", 
        content: "Sorry, I encountered an error. Please try again later." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <header className="border-b border-border/40 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h1 className="text-2xl font-bold">Finance Advisor</h1>
          </div>
          <p className="text-muted-foreground">Powered by Google Gemini AI</p>
        </header>

        <div className="flex-1 overflow-auto p-4">
          <Card className="border-border/40 h-full flex flex-col">
            <CardHeader>
              <CardTitle>Financial Assistant</CardTitle>
              <CardDescription>Ask me anything about markets, stocks, crypto, or trading suggestions</CardDescription>
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
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 pt-4">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  placeholder="Ask about markets, stocks, crypto trading suggestions..."
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
    </Sidebar>
  )
}