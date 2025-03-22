// components/trading-justification-modal.jsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart2, Brain, Calculator, ChevronRight, HelpCircle, LineChart, TrendingUp } from "lucide-react"

export function TradingJustificationModal({ open, onOpenChange, orderData }) {
  console.log(orderData)
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
          </DialogTitle>
        </DialogHeader>
        
        {orderData ? (
          <div className="flex flex-col gap-4">
            {orderData}
            </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-lg font-semibold">No trading justification data available</p>
              <p className="text-muted-foreground">Please make a trade to view the trading justification</p>
            </div>
          </div>
        )}
        
      </DialogContent>
    </Dialog>
  );
  
}