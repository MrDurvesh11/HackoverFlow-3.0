"use client"

import { useState } from "react"
import { Check, ChevronRight, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface WelcomeModalProps {
  onClose: () => void
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border/40 bg-gradient-card shadow-xl">
        <CardHeader className="relative">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse-slow"></div>
              <div className="absolute inset-0.5 bg-background rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="font-bold text-lg tracking-tight">
              TradeSense<span className="text-blue-500">_Ai</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to TradeSense_Ai</CardTitle>
          <CardDescription>Your AI-powered trading platform for stocks and cryptocurrencies</CardDescription>
          <div className="flex gap-1 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-blue-500" : "bg-muted"}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Powerful Trading Dashboard</h3>
              <p className="text-muted-foreground">
                Your dashboard provides real-time market data, portfolio tracking, and AI-powered insights to help you
                make informed trading decisions.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Market Overview</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Track stocks and crypto markets in real-time with advanced charts and indicators.
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Portfolio Tracking</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monitor your investments, track performance, and analyze asset allocation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Our advanced AI models analyze market trends, predict price movements, and provide personalized trading
                recommendations.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Predictive Analytics</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    LSTM and Monte Carlo simulations to forecast price movements with confidence intervals.
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Sentiment Analysis</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Real-time analysis of market sentiment from news, social media, and financial reports.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Automated Trading Strategies</h3>
              <p className="text-muted-foreground">
                Create, backtest, and deploy automated trading strategies that execute trades based on your predefined
                rules and AI recommendations.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Strategy Builder</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create custom trading strategies with an intuitive visual interface.
                  </p>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Backtesting</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Test your strategies against historical data to validate performance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          ) : (
            <div></div>
          )}
          <Button onClick={nextStep}>
            {step < totalSteps ? (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

