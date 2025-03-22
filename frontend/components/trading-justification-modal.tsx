// components/trading-justification-modal.jsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart2, Brain, Calculator, ChevronRight, HelpCircle, LineChart, TrendingUp } from "lucide-react"

export function TradingJustificationModal({ open, onOpenChange, orderData }) {
  // Default dummy data
  const dummyData = {
    symbol: "BTCUSDT",
    side: "BUY",
    price: 84209.68,
    timestamp: new Date().toISOString(),
    reasons: [
      {
        category: "Technical Analysis",
        icon: <LineChart className="h-4 w-4" />,
        points: [
          { key: "Moving Average Crossover", value: "EMA(9) crossed above EMA(20)", impact: "high" },
          { key: "RSI Level", value: "RSI at 54.5 - neutral with upward momentum", impact: "medium" },
          { key: "Volume Profile", value: "Increasing volume confirms uptrend", impact: "high" }
        ]
      },
      {
        category: "Machine Learning",
        icon: <Brain className="h-4 w-4" />,
        points: [
          { key: "LSTM Prediction", value: "Predicted 0.54% price increase in next 6 candles", impact: "high" },
          { key: "Trend Direction", value: "Weak uptrend with 51% confidence", impact: "medium" },
          { key: "Pattern Recognition", value: "Identified accumulation pattern", impact: "medium" }
        ]
      },
      {
        category: "Risk Analysis",
        icon: <BarChart2 className="h-4 w-4" />,
        points: [
          { key: "Reward-to-Risk Ratio", value: "2.5:1 reward/risk ratio", impact: "high" },
          { key: "Portfolio Exposure", value: "Current position is 5% of portfolio", impact: "low" },
          { key: "Volatility", value: "Recent volatility below 30-day average", impact: "medium" }
        ]
      },
      {
        category: "Monte Carlo Simulation",
        icon: <Calculator className="h-4 w-4" />,
        points: [
          { key: "Probability of Profit", value: "62% probability of price increase", impact: "high" },
          { key: "Expected Return", value: "Average expected return of 0.026%", impact: "medium" },
          { key: "Downside Risk", value: "5% chance of 1.2% loss or worse", impact: "medium" }
        ]
      }
    ],
    conclusion: "Multiple indicators align for a bullish signal. The LSTM model shows high confidence in a continued uptrend, while technical indicators confirm the momentum. Risk parameters are within acceptable limits, making this an attractive opportunity with a favorable reward-to-risk ratio."
  }

  // Use the provided orderData or fallback to dummy data
  const data = orderData || dummyData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Trading Decision Justification
            <Badge 
              variant={data.side === "BUY" ? "success" : "destructive"} 
              className="ml-2"
            >
              {data.side}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {`${data.symbol} at $${data.price.toFixed(2)} • ${new Date(data.timestamp).toLocaleString()}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          {data.reasons.map((category, idx) => (
            <Card key={idx} className="bg-muted/30 p-4 border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-background/50 p-1.5 rounded-full">
                  {category.icon}
                </div>
                <h4 className="font-semibold">{category.category}</h4>
              </div>
              
              <div className="space-y-2">
                {category.points.map((point, pointIdx) => (
                  <div key={pointIdx} className="pl-8 relative">
                    <div className="absolute left-0 top-1">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{point.key}</span>
                      <Badge 
                        variant={point.impact === "high" ? "success" : point.impact === "medium" ? "warning" : "outline"}
                        className="text-xs"
                      >
                        {point.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{point.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          
          <div className="bg-muted/30 p-4 rounded-md border border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4" />
              <h4 className="font-semibold">Conclusion</h4>
            </div>
            <p className="text-sm">{data.conclusion}</p>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="default" size="sm" className="gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>View Detailed Analysis</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}